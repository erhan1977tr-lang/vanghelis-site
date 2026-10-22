import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/latin-ext-400.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './styles.css';
import { contact, hero } from './config.js';
import { initParc } from './parc.js';

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
['acasa', 'parc', 'servicii', 'contact'].forEach((id) => spy.observe(document.getElementById(id)));

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
  if (!contact.phone && !contact.email) rows.push(['Date de contact', '<span class="muted">Vor fi adăugate în versiunea finală.</span>']);
  dl.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
})();

initParc(document.getElementById('parc'));
observeReveals();
