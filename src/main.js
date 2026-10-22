import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/latin-ext-400.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './styles.css';
import { contact, hero } from './config.js';
import { groups, machines, icons } from './fleet.js';

const $ = (sel, root = document) => root.querySelector(sel);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Header: micșorare la scroll ---------- */
const header = $('#header');
const onScroll = () => header.classList.toggle('is-compact', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Meniu mobil ---------- */
const burger = $('#burger');
const nav = $('#nav');
const setMenu = (open) => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
  document.body.classList.toggle('menu-open', open);
  if (open) nav.querySelector('a').focus();
};
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
});
window.matchMedia('(min-width: 960px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* ---------- Secțiune activă în meniu ---------- */
const navLinks = [...document.querySelectorAll('.nav__list a')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['acasa', 'despre', 'servicii', 'utilaje', 'zone', 'contact'].forEach((id) => spy.observe(document.getElementById(id)));

/* ---------- Animații de intrare ---------- */
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); revealer.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
const observeReveals = (root = document) => root.querySelectorAll('.reveal:not(.is-in)').forEach((el) => revealer.observe(el));
document.documentElement.classList.add('js');

/* ---------- Hero: parallax discret + video opțional ---------- */
const heroImg = $('#heroImg');
const heroEl = $('.hero');
let ticking = false;
const parallax = () => {
  ticking = false;
  if (reduceMotion.matches) { heroImg.style.removeProperty('--py'); return; }
  const y = Math.min(window.scrollY, heroEl.offsetHeight);
  heroEl.style.setProperty('--py', `${(y * 0.18).toFixed(1)}px`);
};
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });

if (hero.video && !reduceMotion.matches && window.innerWidth >= hero.minVideoWidth) {
  const v = document.createElement('video');
  Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'none' });
  v.className = 'hero__video';
  v.setAttribute('aria-hidden', 'true');
  v.poster = heroImg.currentSrc || heroImg.src;
  if (hero.video.webm) v.insertAdjacentHTML('beforeend', `<source src="${hero.video.webm}" type="video/webm">`);
  if (hero.video.mp4) v.insertAdjacentHTML('beforeend', `<source src="${hero.video.mp4}" type="video/mp4">`);
  v.addEventListener('playing', () => heroEl.classList.add('has-video'), { once: true });
  heroImg.after(v);
  v.play().catch(() => v.remove());
}

/* ---------- Praf în lumină (canvas ușor, oprit la mișcare redusă) ---------- */
(() => {
  const canvas = $('#heroDust');
  const ctx = canvas.getContext('2d');
  let w, h, dpr, parts = [], raf = null, visible = true;
  const make = () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: Math.random() * 1.6 + 0.3,
    vx: Math.random() * 0.25 + 0.05, vy: -(Math.random() * 0.12 + 0.02),
    a: Math.random() * 0.45 + 0.08,
  });
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, (w * h) / 16000));
    parts = Array.from({ length: n }, make);
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x > w + 4) p.x = -4;
      if (p.y < -4) p.y = h + 4;
      ctx.beginPath();
      ctx.fillStyle = `rgba(232, 196, 120, ${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  const start = () => { if (!raf && visible && !reduceMotion.matches) draw(); };
  const stop = () => { cancelAnimationFrame(raf); raf = null; };
  resize();
  window.addEventListener('resize', () => { resize(); });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) { stop(); ctx.clearRect(0, 0, w, h); } else start(); });
  start();
})();

/* ---------- Utilaje: filtre + carduri ---------- */
const grid = $('#fleetGrid');
const filters = $('#filters');
const select = $('#f-service');

filters.innerHTML = groups.map((g, i) =>
  `<button type="button" class="chip" data-group="${g.id}" aria-pressed="${i === 0}">${g.label}</button>`).join('');

const renderFleet = (group = 'all') => {
  const list = machines.filter((m) => group === 'all' || m.group === group);
  grid.innerHTML = list.map((m) => `
    <li class="machine reveal${m.image ? ' machine--photo' : ''}">
      <div class="machine__visual">
        ${m.image
          ? `<img src="${m.image.src}" srcset="${m.image.srcset}" sizes="(min-width: 960px) 40vw, 100vw" alt="" loading="lazy" decoding="async" width="1200" height="800">`
          : `<span class="machine__icon" aria-hidden="true">${icons[m.icon]}</span>`}
      </div>
      <div class="machine__body">
        <p class="machine__group mono">${groups.find((g) => g.id === m.group).label}</p>
        <h3 class="machine__name">${m.name}</h3>
        <p class="machine__note">${m.note}</p>
        <button type="button" class="link-btn" data-machine="${m.id}">Solicită detalii <span aria-hidden="true">→</span></button>
      </div>
    </li>`).join('') + `
    <li class="machine machine--cta reveal">
      <div class="machine__body">
        <p class="machine__group mono">Altă nevoie?</p>
        <h3 class="machine__name">Nu știi ce utilaj se potrivește lucrării?</h3>
        <a class="link-btn" href="#contact">Descrie lucrarea <span aria-hidden="true">→</span></a>
      </div>
    </li>`;
  observeReveals(grid);
};

filters.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
  renderFleet(btn.dataset.group);
});

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-machine]');
  if (!btn) return;
  select.value = `utilaj:${btn.dataset.machine}`;
  clearError(select);
  const form = $('#quoteForm');
  form.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  select.classList.add('is-highlight');
  setTimeout(() => select.classList.remove('is-highlight'), 1600);
  setTimeout(() => $('#f-name').focus({ preventScroll: true }), reduceMotion.matches ? 0 : 600);
});

/* ---------- Opțiuni formular ---------- */
const services = ['Excavații și fundații', 'Terasamente și nivelări', 'Demolări mecanizate', 'Transport și agregate',
  'Drumuri și compactare', 'Rețele și amenajări exterioare', 'Organizare de șantier', 'Întreținere utilaje'];
select.innerHTML = `
  <option value="">Alege o opțiune</option>
  <optgroup label="Servicii">${services.map((s, i) => `<option value="serviciu:${i}">${s}</option>`).join('')}</optgroup>
  <optgroup label="Utilaje">${machines.map((m) => `<option value="utilaj:${m.id}">${m.name}</option>`).join('')}</optgroup>
  <option value="altceva">Altceva / nu știu încă</option>`;

/* ---------- Date de contact (din config) ---------- */
(() => {
  const dl = $('#contactInfo');
  const rows = [];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  if (contact.phone) rows.push(['Telefon', `<a href="tel:${contact.phone.replace(/\s/g, '')}">${esc(contact.phone)}</a>`]);
  if (contact.email) rows.push(['E-mail', `<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`]);
  if (contact.whatsapp) rows.push(['WhatsApp', `<a href="https://wa.me/${esc(contact.whatsapp)}" rel="noopener">Scrie-ne pe WhatsApp</a>`]);
  if (contact.address) rows.push(['Adresă', esc(contact.address)]);
  if (contact.hours) rows.push(['Program', esc(contact.hours)]);
  rows.push(['Zone', 'Constanța, Tulcea, București, Ilfov și împrejurimi']);
  if (!contact.phone && !contact.email) rows.push(['Date de contact', '<span class="muted">Vor fi adăugate în versiunea finală.</span>']);
  dl.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
})();

/* ---------- Validare formular + previzualizare ---------- */
const form = $('#quoteForm');
const modal = $('#previewModal');
const messages = {
  name: 'Te rugăm să introduci numele și prenumele.',
  phone: 'Te rugăm să introduci un număr de telefon valid.',
  email: 'Adresa de e-mail nu pare corectă.',
  location: 'Te rugăm să indici localitatea sau județul.',
  service: 'Alege serviciul sau utilajul dorit.',
  details: 'Te rugăm să descrii pe scurt lucrarea (minimum 10 caractere).',
};
const setError = (el, msg) => {
  el.setAttribute('aria-invalid', 'true');
  $(`#e-${el.name}`).textContent = msg;
};
function clearError(el) {
  el.removeAttribute('aria-invalid');
  const e = $(`#e-${el.name}`);
  if (e) e.textContent = '';
}
const validators = {
  name: (v) => v.trim().length >= 3,
  phone: (v) => /^[+\d][\d\s().-]{8,}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 9,
  email: (v) => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  location: (v) => v.trim().length >= 2,
  service: (v) => v !== '',
  details: (v) => v.trim().length >= 10,
};
const validate = (el) => {
  const fn = validators[el.name];
  if (!fn) return true;
  if (fn(el.value)) { clearError(el); return true; }
  setError(el, messages[el.name]);
  return false;
};
form.addEventListener('blur', (e) => { if (e.target.matches('input, select, textarea') && e.target.value) validate(e.target); }, true);
form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid')) validate(e.target); });
form.addEventListener('change', (e) => { if (e.target.tagName === 'SELECT') validate(e.target); });

const labels = {
  name: 'Nume și prenume', company: 'Companie', phone: 'Telefon', email: 'E-mail', location: 'Localitatea / județul',
  service: 'Serviciul sau utilajul dorit', period: 'Perioada estimată', details: 'Detalii despre lucrare',
};
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fields = [...form.elements].filter((el) => el.name);
  const invalid = fields.filter((el) => !validate(el));
  if (invalid.length) { invalid[0].focus(); return; }
  const summary = $('#modalSummary');
  summary.replaceChildren(...fields.filter((el) => el.value.trim()).map((el) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = labels[el.name];
    dd.textContent = el.tagName === 'SELECT' ? el.selectedOptions[0].textContent : el.value.trim();
    row.append(dt, dd);
    return row;
  }));
  modal.showModal();
});
modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) modal.close(); });

/* ---------- Hartă (încărcată la cerere) ---------- */
const drawMap = (romania) => {
  const served = { 'ro-ct': 'Constanța', 'ro-tl': 'Tulcea', 'ro-b': 'București', 'ro-if': 'Ilfov' };
  const paths = romania.locations.map((l) =>
    `<path d="${l.path}" class="${served[l.id] ? 'is-served' : ''}"><title>${l.id === 'ro-b' ? 'București' : l.name}</title></path>`).join('');
  // Etichete poziționate aproximativ pe centrele județelor (calculate după desenare).
  $('#zoneMap').insertAdjacentHTML('afterbegin',
    `<svg viewBox="${romania.viewBox}" role="img" aria-label="Harta României — județele deservite evidențiate"><g class="map">${paths}</g><g class="map__labels"></g></svg>`);
  const svg = $('#zoneMap svg');
  const labelsG = svg.querySelector('.map__labels');
  const pathEls = [...svg.querySelectorAll('path')];
  const place = (id, text, dx = 0, dy = 0, anchor = 'middle') => {
    const p = pathEls[romania.locations.findIndex((l) => l.id === id)];
    const b = p.getBBox();
    const x = b.x + b.width / 2 + dx, y = b.y + b.height / 2 + dy;
    labelsG.insertAdjacentHTML('beforeend',
      `<circle cx="${x}" cy="${y}" r="2.6"/><text x="${x + (anchor === 'end' ? -7 : anchor === 'start' ? 7 : 0)}" y="${y + (anchor === 'middle' ? -8 : 4)}" text-anchor="${anchor}">${text}</text>`);
  };
  place('ro-ct', 'Constanța', 2, 6, 'start');
  place('ro-tl', 'Tulcea', 6, -2, 'start');
  place('ro-b', 'București', 0, 2, 'end');
  place('ro-if', 'Ilfov', 8, -9, 'start');
};
new IntersectionObserver(([en], obs) => {
  if (!en.isIntersecting) return;
  obs.disconnect();
  import('@svg-maps/romania').then((m) => drawMap(m.default));
}, { rootMargin: '400px 0px' }).observe($('#zoneMap'));

renderFleet();
observeReveals();
