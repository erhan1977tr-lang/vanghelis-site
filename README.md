# VANGHELIS TRANS — web demo (v0.1)

Tek sayfalık, tamamen Romence tanıtım demosu. Vite + saf JavaScript, framework yok.

## Açma
- **Hızlı bakış:** `dist/index.html` dosyasına çift tıklayın (sunucu gerekmez).
- **Geliştirme:** `npm install` → `npm run dev` → http://localhost:5173
- **Yayın paketi:** `npm run build` → `dist/` klasörü olduğu gibi herhangi bir sunucuya (ör. vanghelis.gkh.ro) yüklenebilir.

## Nereden düzenlenir
- `src/config.js` — telefon, e-posta, adres, WhatsApp, çalışma saatleri, hero videosu. `null` olan alan sitede link/buton olarak görünmez.
- `src/fleet.js` — makine kategorileri, filtreler, açıklamalar, (ileride) gerçek fotoğraflar.
- `index.html` — bölüm metinleri. `src/styles.css` — renkler ve tipografi (`:root` değişkenleri).
- `public/img/` — görseller.

## Hero videosu eklemek
1. `public/video/hero.mp4` (ve isterseniz `hero.webm`) ekleyin — 5–8 sn, sessiz, döngüye uygun, ~1920×1080, 2–4 MB.
2. `src/config.js` içinde: `video: { mp4: 'video/hero.mp4', webm: 'video/hero.webm' }`
3. `npm run build`. Video yalnızca ≥900 px ekranlarda ve "azaltılmış hareket" kapalıysa oynar; yüklenene kadar poster görseli görünür.

Higgsfield için önerilen istem (image-to-video, kaynak: `public/img/hero-excavator-1500.webp`):
> Cinematic golden-hour construction site, heavy excavator slowly lowering its bucket into soil, subtle dust drifting in warm backlight, slow controlled camera push-in, realistic mechanical motion, no text, no logos, seamless loop, 6 seconds.

## Notlar
- `noindex, nofollow` açık; analitik / çerez yok. Form hiçbir veri göndermez veya saklamaz.
- Harita: @svg-maps/romania (CC BY 4.0, footer’da atıf var).

## Otomatik yayın (vanghelis.gkh.ro)
`main` dalına her push'ta GitHub Actions siteyi derler (`npm run build`) ve `dist/` içeriğini FTPS ile GreenGeeks'e yükler (yalnızca değişen dosyalar).

Depo sırları (Settings → Secrets and variables → Actions): `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` — ev dizini `vanghelis.gkh.ro` alt alan adının klasörü olan cPanel FTP hesabı.
`noindex` hem `<meta>` etiketiyle hem `.htaccess` içindeki `X-Robots-Tag` başlığıyla açık.
