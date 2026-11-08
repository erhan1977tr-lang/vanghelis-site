"""Utilaje kampanyası: birlesik-firma-listesi.csv içindeki her firmaya TEK e-posta gönderir.

Kullanım (bu klasörde):
  python send_campaign.py --dry-run    # hiçbir şey göndermez; konu ve alıcıları listeler
  python send_campaign.py              # gönderir (şifre bir kez sorulur, kaydedilmez)

- Konu ve hitapta firmanın adı ("eposta_firma_adi" sütunu) yazılır.
- Her gönderim gonderim-kaydi.csv dosyasına yazılır (zaman, firma, adres, sonuç, Message-ID).
- Kayıtta "GÖNDERİLDİ" olan adrese ikinci kez gönderilmez (betik yarıda kesilirse güvenle yeniden çalıştırılabilir).
- dezabone.txt içindeki adreslere hiç gönderilmez.
- Her e-postanın bir kopyası info@gkh.ro posta kutusunun "Gönderilmiş" klasörüne (IMAP) eklenir.
- İki gönderim arasında 20 saniye beklenir.
"""
import argparse
import csv
import getpass
import imaplib
import os
import smtplib
import ssl
import sys
import time
from datetime import datetime
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_email as be  # noqa: E402

LIST = HERE / "birlesik-firma-listesi.csv"
LOG = HERE / "gonderim-kaydi.csv"
OPTOUT = HERE / "dezabone.txt"
DELAY = 20

host = os.environ.get("SMTP_HOST", "mail.gkh.ro")
port = int(os.environ.get("SMTP_PORT", "465"))
imap_host = os.environ.get("IMAP_HOST", host)
user = os.environ.get("SMTP_USER", be.SENDER["email"])


def build_message(firma: str, to: str) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = be.subject(firma)
    msg["From"] = f"GKH Digital <{be.SENDER['email']}>"
    msg["To"] = to
    msg["Reply-To"] = be.SENDER["email"]
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=be.SENDER["email"].split("@")[1])
    msg["List-Unsubscribe"] = f"<mailto:{be.SENDER['email']}?subject=Dezabonare>"
    msg.set_content(be.text(firma))
    msg.add_alternative(be.build(firma, "cid"), subtype="html")
    part = msg.get_payload()[1]
    part.add_related((HERE / "demo-preview.jpg").read_bytes(), "image", "jpeg", cid="<demo-preview>")
    part.add_related((HERE / "gkh-digital-logo.png").read_bytes(), "image", "png", cid="<gkh-logo>")
    return msg


def already_sent() -> set[str]:
    if not LOG.exists():
        return set()
    with LOG.open(encoding="utf-8-sig") as f:
        return {r["email"].strip().lower() for r in csv.DictReader(f) if r["sonuc"] == "GÖNDERİLDİ"}


def log(row: dict) -> None:
    new = not LOG.exists()
    with LOG.open("a", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["zaman", "no", "firma", "email", "sonuc", "detay", "message_id"])
        if new:
            w.writeheader()
        w.writerow(row)


def sent_folder(imap: imaplib.IMAP4_SSL) -> str | None:
    """returns the Sent folder name already quoted for IMAP commands"""
    import re
    pat = re.compile(r'\((?P<flags>[^)]*)\) (?:"[^"]*"|NIL) (?P<name>.+)')
    _, data = imap.list()
    boxes = []
    for raw in data or []:
        m = pat.match(raw.decode(errors="replace"))
        if m:
            boxes.append((m["flags"], m["name"].strip().strip('"')))
    name = next((n for f, n in boxes if "\\Sent" in f), None) or next(
        (c for c in ("INBOX.Sent", "Sent", "INBOX.Sent Items", "Sent Items") if any(n == c for _, n in boxes)), None)
    return None if name is None else '"' + name.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="en fazla bu kadar gönder (0 = hepsi)")
    a = ap.parse_args()

    with LIST.open(encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    optout = set()
    if OPTOUT.exists():
        optout = {l.strip().lower() for l in OPTOUT.read_text(encoding="utf-8").splitlines() if l.strip()}
    done = already_sent()
    todo = [r for r in rows if r["email"].strip() and r["email"].strip().lower() not in done | optout]
    if a.limit:
        todo = todo[: a.limit]
    print(f"Listede {len(rows)} firma; daha önce gönderilen {len(done)}; dezabone {len(optout)}; şimdi gönderilecek {len(todo)}.")
    for r in todo:
        print(f"  {r['no']:>3}  {r['email']:<38} {be.subject(r['eposta_firma_adi'])}")
    if a.dry_run or not todo:
        return

    pw = getpass.getpass(f"{user} şifresi: ")
    ctx = ssl.create_default_context()
    imap = folder = None
    try:
        imap = imaplib.IMAP4_SSL(imap_host, 993, ssl_context=ctx)
        imap.login(user, pw)
        folder = sent_folder(imap)
        print(f"Kopyalar şu klasöre eklenecek: {folder}" if folder else "Gönderilmiş klasörü bulunamadı; yalnızca kayıt dosyası tutulacak.")
    except Exception as e:  # IMAP yalnızca kopya için; gönderimi durdurmaz
        print(f"IMAP bağlantısı yok ({e}); yalnızca kayıt dosyası tutulacak.")
        imap = None

    smtp = smtplib.SMTP_SSL(host, port, context=ctx, timeout=60) if port == 465 else smtplib.SMTP(host, port, timeout=60)
    if port != 465:
        smtp.starttls(context=ctx)
    smtp.login(user, pw)
    ok = 0
    for i, r in enumerate(todo, 1):
        to = r["email"].strip()
        msg = build_message(r["eposta_firma_adi"], to)
        row = {"zaman": datetime.now().isoformat(timespec="seconds"), "no": r["no"], "firma": r["firma"],
               "email": to, "sonuc": "", "detay": "", "message_id": msg["Message-ID"]}
        try:
            try:
                refused = smtp.send_message(msg, to_addrs=[to])
            except smtplib.SMTPServerDisconnected:
                smtp = smtplib.SMTP_SSL(host, port, context=ctx, timeout=60)
                smtp.login(user, pw)
                refused = smtp.send_message(msg, to_addrs=[to])
            if refused:
                row.update(sonuc="REDDEDİLDİ", detay=str(refused))
            else:
                row["sonuc"] = "GÖNDERİLDİ"
                ok += 1
                if imap and folder:
                    try:
                        imap.append(folder, "(\\Seen)", imaplib.Time2Internaldate(time.time()), msg.as_bytes())
                    except Exception as e:
                        row["detay"] = f"kopya eklenemedi: {e}"
        except smtplib.SMTPException as e:
            row.update(sonuc="HATA", detay=str(e))
        log(row)
        print(f"[{i}/{len(todo)}] {row['sonuc']:<11} {to}  {row['detay']}")
        if i < len(todo):
            time.sleep(DELAY)
    smtp.quit()
    if imap:
        imap.logout()
    print(f"Bitti: {ok}/{len(todo)} gönderildi. Kayıt: {LOG}")


if __name__ == "__main__":
    main()
