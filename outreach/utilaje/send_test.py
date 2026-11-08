"""Tek bir TEST e-postası gönderir: yalnızca erhan1977tr@gmail.com adresine.

Kullanım (bu klasörde):  python send_test.py
SMTP şifresi ekranda sorulur, hiçbir yere kaydedilmez. Alıcı kodda sabittir, değiştirilemez.
Ortam değişkenleri (isteğe bağlı): SMTP_HOST (varsayılan mail.gkh.ro), SMTP_PORT (465), SMTP_USER (info@gkh.ro)
"""
import getpass
import os
import smtplib
import ssl
import sys
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_email as be  # noqa: E402

TEST_RECIPIENT = "erhan1977tr@gmail.com"  # sabit; firmalara gönderim bu betikle yapılamaz
FIRMA = "Exemplu Terasamente SRL"

host = os.environ.get("SMTP_HOST", "mail.gkh.ro")
port = int(os.environ.get("SMTP_PORT", "465"))
user = os.environ.get("SMTP_USER", be.SENDER["email"])

msg = EmailMessage()
msg["Subject"] = "[TEST] " + be.subject(FIRMA)
msg["From"] = f"GKH Digital <{be.SENDER['email']}>"
msg["To"] = TEST_RECIPIENT
msg["Reply-To"] = be.SENDER["email"]
msg["Date"] = formatdate(localtime=True)
msg["Message-ID"] = make_msgid(domain=be.SENDER["email"].split("@")[1])
msg["List-Unsubscribe"] = f"<mailto:{be.SENDER['email']}?subject=Dezabonare>"
msg.set_content(be.text(FIRMA))
msg.add_alternative(be.build(FIRMA, "cid"), subtype="html")
html_part = msg.get_payload()[1]
html_part.add_related((HERE / "demo-preview.jpg").read_bytes(), "image", "jpeg", cid="<demo-preview>")
html_part.add_related((HERE / "gkh-digital-logo.png").read_bytes(), "image", "png", cid="<gkh-logo>")

print(f"SMTP: {user} @ {host}:{port}  ->  {TEST_RECIPIENT}")
pw = getpass.getpass("SMTP şifresi: ")
ctx = ssl.create_default_context()
if port == 465:
    s = smtplib.SMTP_SSL(host, port, context=ctx, timeout=30)
else:
    s = smtplib.SMTP(host, port, timeout=30)
    s.starttls(context=ctx)
with s:
    s.login(user, pw)
    refused = s.send_message(msg, to_addrs=[TEST_RECIPIENT])
print("GÖNDERİLDİ" if not refused else f"REDDEDİLDİ: {refused}")
