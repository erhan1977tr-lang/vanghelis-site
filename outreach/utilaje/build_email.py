"""Tanıtım e-postası üreticisi (utilaje demosu).

GKH Marketing AI platformundaki müşteri e-postasının (packages/core/src/demo/email.ts) görünümünü
ve içerik kurallarını izler: "concept demonstrativ" ifadesi, tek demo linki, fiyat / indirim /
garanti / referans / AI ifadesi yok, mevcut site hakkında eksiklik iddiası yok, kimlik + dezabonare.

Kullanım:  python3 build_email.py "Firma SRL" [cid|data] > out.html
  cid  -> görsel src="cid:demo-preview" (gerçek gönderim, görsel ek olarak gömülür)
  data -> görsel data URI (tarayıcıda önizleme)
"""
import base64
import html
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEMO_URL = "https://demo.gkh.ro/utilaje/"

SENDER = {
    "brand": "GKH Digital",
    "legal": "GKH Trading Invest SRL",
    "email": "info@gkh.ro",  # Erhan 2026-11-08
    "phone": "Tel. / WhatsApp: +40 772 163 046",  # Erhan 2026-11-08
    "sites": ["https://gkhdigital.ro", "https://gkhdigital.com"],
}


def subject(firma: str | None) -> str:
    return (
        f"{firma} – un concept demonstrativ de website pentru firme de utilaje și terasamente"
        if firma
        else "Un concept demonstrativ de website pentru firme de utilaje și terasamente"
    )


INTRO = [
    "Vă scriem deoarece lucrăm la prezentarea online a firmelor din domeniul utilajelor, excavațiilor și terasamentelor din România.",
    "Pornind de aici, am realizat un concept demonstrativ de website live, modern și corporativ, gândit special pentru acest sector.",
]
POINTS = [
    "Prima impresie puternică: un video de șantier care se derulează odată cu pagina.",
    "Prezentare clară a serviciilor, a parcului de utilaje și a proiectelor realizate.",
    "Experiență gândită pentru telefon și tabletă, cu acces rapid la apel și la cererea de ofertă.",
]
ILLUSTRATIVE = (
    "Demonstrația este un exemplu de lucru realizat de GKH Digital pentru o firmă fictivă („GKH”): "
    "textele, cifrele și imaginile sunt ilustrative, generate digital. Varianta finală se construiește "
    "cu datele, fotografiile și identitatea vizuală a companiei dumneavoastră."
)
CONTACT = (
    "Dacă v-a trezit interesul, vă rugăm să ne contactați pentru o ofertă detaliată și pentru informații "
    "suplimentare. Ne bucurăm să vă prezentăm conceptul și într-o scurtă discuție online."
)


def optout(legal: str, mail: str) -> str:
    return (
        f"Acest mesaj este o comunicare comercială transmisă de {legal}, o singură dată, către adresa de contact "
        f"publicată de companie. Dacă nu doriți să mai primiți mesaje de la noi, răspundeți cu „Dezabonare” "
        f"sau scrieți la {mail}; adresa va fi eliminată imediat din evidențele noastre."
    )


def text(firma: str | None) -> str:
    s = SENDER
    greet = f"Stimată echipă {firma}," if firma else "Stimată echipă,"
    lines = [greet, "", *INTRO, "", "Puteți vizualiza demonstrația aici:", DEMO_URL, "",
             "Conceptul pune accent pe:", *[f"• {p}" for p in POINTS], "", ILLUSTRATIVE, "", CONTACT, "",
             "Cu stimă,", f"Echipa {s['brand']}", f"{s['brand']} este o marcă a {s['legal']}.",
             *[x for x in [s["email"], s["phone"], *s["sites"]] if x], "", "—", optout(s["legal"], s["email"])]
    return "\n".join(lines) + "\n"


def build(firma: str | None, mode: str = "data") -> str:
    s = SENDER
    e = html.escape
    font = "font-family:Arial,Helvetica,sans-serif;"
    para = lambda t: f'<p style="margin:0 0 14px;{font}font-size:15px;line-height:1.6;color:#1f2933;">{e(t)}</p>'
    if mode == "cid":
        img_src = "cid:demo-preview"
        logo_src = "cid:gkh-logo"
    else:
        logo_b64 = base64.b64encode((HERE / "gkh-digital-logo.png").read_bytes()).decode()
        logo_src = f"data:image/png;base64,{logo_b64}"
        b64 = base64.b64encode((HERE / "demo-preview.jpg").read_bytes()).decode()
        img_src = f"data:image/jpeg;base64,{b64}"
    greet = f"Stimată echipă {firma}," if firma else "Stimată echipă,"
    contact_html = "<br>".join(
        ([f'<a href="mailto:{e(s["email"])}" style="color:#1f2a37;">{e(s["email"])}</a>'] if s["email"] else [])
        + ([f'<a href="tel:+40772163046" style="color:#1f2a37;">Tel.: +40 772 163 046</a> · <a href="https://wa.me/40772163046" style="color:#1f2a37;">WhatsApp</a>'] if s["phone"] else [])
        + [f'<a href="{e(u)}" style="color:#1f2a37;">{e(u.replace("https://", ""))}</a>' for u in s["sites"]]
    )
    subj = subject(firma)
    return f"""<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light"><title>{e(subj)}</title></head>
<body style="margin:0;padding:0;background:#f3f1ed;">
<div style="display:none;max-height:0;overflow:hidden;">Un website demonstrativ live pentru firme de utilaje, excavații și terasamente.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f1ed;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e3ddd3;border-radius:8px;">
<tr><td style="padding:26px 28px 4px;"><img src="{logo_src}" width="150" alt="GKH Digital" style="display:block;width:150px;height:auto;border:0;"></td></tr>
<tr><td style="padding:18px 28px 4px;">
{para(greet)}
{''.join(para(t) for t in INTRO)}
</td></tr>
<tr><td style="padding:4px 28px 6px;"><a href="{DEMO_URL}" style="text-decoration:none;"><img src="{img_src}" width="544" alt="Previzualizare: concept demonstrativ de website pentru o firmă de utilaje și terasamente" style="display:block;width:100%;max-width:544px;height:auto;border:0;border-radius:6px;"></a>
<p style="margin:6px 0 0;{font}font-size:12px;line-height:1.4;color:#8a8f98;text-align:center;">Previzualizare · pagina principală a conceptului demonstrativ</p></td></tr>
<tr><td style="padding:14px 28px 4px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 10px;"><tr><td style="border-radius:6px;background:#0560d0;"><a href="{DEMO_URL}" style="display:inline-block;padding:13px 24px;{font}font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:6px;">Vizualizați demonstrația</a></td></tr></table>
<p style="margin:0 0 18px;{font}font-size:13px;line-height:1.5;color:#5b6573;">{DEMO_URL}</p>
<p style="margin:0 0 8px;{font}font-size:15px;line-height:1.6;color:#1f2933;font-weight:bold;">Conceptul pune accent pe:</p>
<ul style="margin:0 0 16px;padding-left:20px;{font}font-size:15px;line-height:1.6;color:#1f2933;">
{''.join(f'<li style="margin:0 0 6px;">{e(p)}</li>' for p in POINTS)}
</ul>
<p style="margin:0 0 14px;padding:10px 12px;background:#f7f5f1;border-left:3px solid #c9bfae;{font}font-size:13px;line-height:1.55;color:#4a5563;">{e(ILLUSTRATIVE)}</p>
{para(CONTACT)}
</td></tr>
<tr><td style="padding:6px 28px 24px;{font}font-size:14px;line-height:1.6;color:#1f2933;">Cu stimă,<br><strong>Echipa {e(s['brand'])}</strong><br><span style="color:#5b6573;">{e(s['brand'])} este o marcă a {e(s['legal'])}.</span><br>{contact_html}</td></tr>
<tr><td style="padding:14px 28px;background:#f7f5f1;border-top:1px solid #e3ddd3;border-radius:0 0 8px 8px;{font}font-size:11px;line-height:1.5;color:#7a808a;">{e(optout(s['legal'], s['email']))}</td></tr>
</table>
</td></tr></table>
</body></html>
"""


if __name__ == "__main__":
    firma = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else None
    mode = sys.argv[2] if len(sys.argv) > 2 else "data"
    sys.stdout.write(text(firma) if mode == "text" else build(firma, mode))
