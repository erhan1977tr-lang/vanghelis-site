"""Gönderilen kampanya e-postalarının kopyalarını info@gkh.ro "Sent" klasörüne ekler (hiçbir şey GÖNDERMEZ).

gonderim-kaydi.csv içindeki her GÖNDERİLDİ satırı için e-postayı aynı Message-ID ve gönderim zamanıyla
yeniden oluşturur ve IMAP APPEND ile Gönderilmiş klasörüne koyar. Aynı Message-ID klasörde zaten varsa atlar.
Kullanım:  python sent_copies.py
"""
import csv
import getpass
import imaplib
import os
import re
import ssl
import sys
from datetime import datetime
from email.utils import format_datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_email as be  # noqa: E402
import send_campaign as sc  # noqa: E402

LIST_RE = re.compile(r'\((?P<flags>[^)]*)\) (?:"(?P<d>[^"]*)"|NIL) (?P<name>.+)')


def find_sent(imap: imaplib.IMAP4_SSL) -> str:
    _, data = imap.list()
    boxes = []
    for raw in data or []:
        m = LIST_RE.match(raw.decode(errors="replace"))
        if m:
            boxes.append((m["flags"], m["name"].strip().strip('"')))
    for flags, name in boxes:
        if "\\Sent" in flags:
            return name
    for cand in ("INBOX.Sent", "Sent", "INBOX.Sent Items", "Sent Items"):
        if any(n == cand for _, n in boxes):
            return cand
    raise SystemExit(f"Gönderilmiş klasörü bulunamadı. Klasörler: {[n for _, n in boxes]}")


def main() -> None:
    with sc.LOG.open(encoding="utf-8-sig") as f:
        sent = [r for r in csv.DictReader(f) if r["sonuc"] == "GÖNDERİLDİ"]
    with sc.LIST.open(encoding="utf-8-sig") as f:
        names = {r["email"].strip().lower(): r["eposta_firma_adi"] for r in csv.DictReader(f)}
    host = os.environ.get("IMAP_HOST", sc.imap_host)
    pw = getpass.getpass(f"{sc.user} şifresi: ")
    imap = imaplib.IMAP4_SSL(host, 993, ssl_context=ssl.create_default_context())
    imap.login(sc.user, pw)
    folder = find_sent(imap)
    q = '"' + folder.replace("\\", "\\\\").replace('"', '\\"') + '"'
    print(f"Klasör: {folder}  ·  {len(sent)} gönderim")
    imap.select(q)
    added = skipped = 0
    for r in sent:
        mid = r["message_id"]
        typ, found = imap.search(None, "HEADER", "Message-ID", f'"{mid}"')
        if typ == "OK" and found and found[0].split():
            skipped += 1
            continue
        firma = names.get(r["email"].strip().lower(), r["firma"])
        msg = sc.build_message(firma, r["email"].strip())
        when = datetime.fromisoformat(r["zaman"]).astimezone()
        msg.replace_header("Message-ID", mid)
        msg.replace_header("Date", format_datetime(when))
        typ, resp = imap.append(q, "(\\Seen)", imaplib.Time2Internaldate(when.timestamp()), msg.as_bytes())
        if typ == "OK":
            added += 1
        else:
            print(f"Eklenemedi: {r['email']} {resp}")
    imap.logout()
    print(f"Bitti: {added} kopya eklendi, {skipped} zaten vardı.")


if __name__ == "__main__":
    main()
