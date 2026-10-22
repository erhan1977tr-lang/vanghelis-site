// Configurare centrală a site-ului demonstrativ.
// Completați câmpurile de mai jos în versiunea finală — restul paginii se actualizează automat.

export const company = {
  name: 'VANGHELIS TRANS S.R.L.',
  shortName: 'VANGHELIS TRANS',
};

// Date de contact: lăsați null până la primirea informațiilor reale.
// Dacă un câmp este null, el nu este afișat ca link sau buton.
export const contact = {
  phone: null, // ex: '+40 7xx xxx xxx'
  email: null, // ex: 'office@exemplu.ro'
  address: null, // ex: 'Str. ..., Constanța'
  whatsapp: null, // număr în format internațional, fără „+”, ex: '407xxxxxxxx'
  hours: null, // ex: 'Luni – Vineri, 08:00 – 18:00'
};

// Hero: imagine (poster) + video opțional.
// Pentru a activa videoclipul, adăugați fișierele în public/video/ și completați căile.
// Videoclipul se încarcă doar pe ecrane mari și doar dacă utilizatorul nu preferă mișcare redusă.
export const hero = {
  video: null, // ex: { webm: 'video/hero.webm', mp4: 'video/hero.mp4' }
  minVideoWidth: 900,
};
