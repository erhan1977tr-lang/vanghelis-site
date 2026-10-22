// Scena „Parc utilaje”: camera intră pe poarta parcului și trece de la un utilaj la altul
// pe măsură ce pagina este derulată. Totul este desenat în SVG (fără biblioteci 3D),
// astfel încât, ulterior, scena poate fi înlocuită cu clipuri video reale.

import { parc as parcCfg } from './config.js';

const BODY = '#b38a35';
const BODY_D = '#8a6a28';
const DARK = '#1c1a17';
const LINE = '#c9a24a';
const STEEL = '#9a958c';
const GLASS = 'url(#pGlass)';
const EARTH = '#5b4429';

const wheel = (cx, cy, r) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#121110" stroke="${LINE}" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="#2a2723" stroke="${LINE}" stroke-opacity=".5" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="${LINE}"/>`;

const gate = `
<g id="pGate">
  <!-- gard -->
  <g stroke="${LINE}" stroke-opacity=".35" stroke-width="2" fill="none">
    <path d="M-1500 -170 H-400 M-1500 -95 H-400 M400 -170 H1500 M400 -95 H1500"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${-1500 + i * 100} 0 V-200 M${500 + i * 100} 0 V-200"/>`).join('')}
  </g>
  <!-- stâlpi -->
  <rect x="-400" y="-470" width="64" height="470" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
  <rect x="336" y="-470" width="64" height="470" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
  <path d="M-400 -60 h64 M-400 -120 h64 M336 -60 h64 M336 -120 h64" stroke="${LINE}" stroke-opacity=".4"/>
  <!-- panou cu numele firmei -->
  <rect x="-420" y="-640" width="840" height="190" fill="#121110" stroke="${LINE}" stroke-width="3"/>
  <rect x="-396" y="-616" width="110" height="110" fill="none" stroke="${LINE}" stroke-width="3"/>
  <text x="-341" y="-541" text-anchor="middle" class="p-mark">VT</text>
  <text x="-262" y="-552" class="p-sign">VANGHELIS <tspan fill="#ece7dd">TRANS</tspan></text>
  <text x="-260" y="-500" class="p-sign-sub">PARC DE UTILAJE</text>
  <!-- barieră -->
  <rect x="-330" y="-140" width="40" height="140" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
  <g id="pBarrier">
    <rect x="-310" y="-128" width="600" height="18" fill="#ece7dd"/>
    <path d="M-250 -128 h40 l-12 18 h-40z M-130 -128 h40 l-12 18 h-40z M-10 -128 h40 l-12 18 h-40z M110 -128 h40 l-12 18 h-40z M230 -128 h40 l-12 18 h-40z" fill="${BODY}"/>
  </g>
  <!-- panou mare -->
  <g transform="translate(560 0)">
    <path d="M90 0 V-300 M330 0 V-300" stroke="${LINE}" stroke-width="10"/>
    <rect x="0" y="-620" width="440" height="330" fill="#121110" stroke="${LINE}" stroke-width="3"/>
    <rect x="0" y="-620" width="440" height="10" fill="${BODY}"/>
    <text x="34" y="-540" class="p-board-k">UTILAJE</text>
    <text x="34" y="-480" class="p-board-k">CU OPERATOR</text>
    <path d="M34 -450 H406" stroke="${LINE}" stroke-opacity=".5"/>
    <text x="34" y="-412" class="p-board-s">EXCAVAȚII • TERASAMENTE</text>
    <text x="34" y="-378" class="p-board-s">DEMOLĂRI • TRANSPORT</text>
    <text x="34" y="-322" class="p-board-xs">Concept demonstrativ</text>
  </g>
</g>`;

const excavator = `
<g transform="translate(1500 0)">
  <rect x="-250" y="-72" width="380" height="72" rx="36" fill="${DARK}" stroke="${LINE}" stroke-width="3" stroke-dasharray="14 6"/>
  <rect x="-236" y="-60" width="352" height="48" rx="24" fill="#26231f"/>
  ${[-200, -144, -88, -32, 24, 80].map((x) => `<circle cx="${x}" cy="-36" r="13" fill="#121110" stroke="${LINE}" stroke-opacity=".6" stroke-width="2"/>`).join('')}
  <rect x="-150" y="-98" width="210" height="26" fill="#26231f"/>
  <path d="M-260 -100 V-172 Q-260 -206 -226 -206 H-40 V-100 Z" fill="${BODY}" stroke="${BODY_D}" stroke-width="2"/>
  <path d="M-240 -180 H-70 M-240 -160 H-70 M-240 -140 H-70" stroke="${BODY_D}" stroke-width="2"/>
  <rect x="-40" y="-206" width="180" height="106" fill="${BODY}" stroke="${BODY_D}" stroke-width="2"/>
  <path d="M-30 -206 V-312 Q-30 -322 -20 -322 H52 L86 -262 V-206 Z" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
  <path d="M-18 -308 H46 L72 -262 V-216 H-18 Z" fill="${GLASS}"/>
  <g id="exBoom">
    <path d="M86 -128 L120 -186 L300 -404 L392 -446 L404 -404 L322 -364 L134 -124 Z" fill="${BODY}" stroke="${BODY_D}" stroke-width="2"/>
    <path d="M124 -196 L262 -360" stroke="${STEEL}" stroke-width="10" stroke-linecap="round"/>
    <path d="M124 -196 L200 -286" stroke="#3a3631" stroke-width="14" stroke-linecap="round"/>
    <circle cx="100" cy="-150" r="10" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
    <g id="exArm">
      <path d="M362 -444 L404 -452 L488 -128 L452 -112 Z" fill="${BODY}" stroke="${BODY_D}" stroke-width="2"/>
      <path d="M392 -470 L446 -300" stroke="${STEEL}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="380" cy="-420" r="10" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
      <g id="exBucket">
        <path d="M466 -130 L530 -112 Q542 -44 478 -8 L412 -16 Q446 -66 466 -130 Z" fill="#3a3631" stroke="${LINE}" stroke-width="2.5"/>
        <path d="M420 -16 l-8 12 M440 -12 l-8 12 M460 -10 l-8 12" stroke="${LINE}" stroke-width="3"/>
        <circle cx="470" cy="-122" r="8" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
      </g>
    </g>
  </g>
</g>`;

const loader = `
<g transform="translate(2700 0)">
  <path d="M-310 -92 V-196 Q-310 -214 -292 -214 H-60 L-40 -92 Z" fill="${BODY}" stroke="${BODY_D}" stroke-width="2"/>
  <path d="M-290 -190 H-90 M-290 -170 H-90 M-290 -150 H-90" stroke="${BODY_D}" stroke-width="2"/>
  <path d="M-130 -214 V-370 H10 L34 -214 Z" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
  <path d="M-118 -356 H2 L20 -226 H-118 Z" fill="${GLASS}"/>
  <rect x="-44" y="-160" width="170" height="70" fill="${BODY}" stroke="${BODY_D}" stroke-width="2"/>
  ${wheel(-170, -64, 64)}
  ${wheel(140, -64, 64)}
  <g id="ldArm">
    <path d="M24 -222 L62 -222 L300 -110 L272 -76 Z" fill="${BODY}" stroke="${BODY_D}" stroke-width="2"/>
    <path d="M60 -150 L230 -112" stroke="${STEEL}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="44" cy="-206" r="10" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
    <g id="ldBucket">
      <path d="M282 -96 L296 -184 L388 -164 Q404 -70 368 -8 L262 -8 Z" fill="#3a3631" stroke="${LINE}" stroke-width="2.5"/>
      <circle cx="288" cy="-94" r="8" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
    </g>
  </g>
</g>`;

const truck = `
<g transform="translate(3900 0)">
  <path id="tkSpill" d="M-560 0 Q-520 -70 -470 -96 Q-440 -60 -420 0 Z" fill="${EARTH}" opacity="0"/>
  <rect x="-430" y="-134" width="870" height="34" fill="#26231f" stroke="${LINE}" stroke-opacity=".5"/>
  ${wheel(-330, -50, 50)}${wheel(-214, -50, 50)}${wheel(130, -50, 50)}${wheel(340, -50, 50)}
  <path d="M262 -112 V-320 Q262 -338 280 -338 H382 Q424 -334 430 -284 L438 -112 Z" fill="#d9d4ca" stroke="#8f8a80" stroke-width="2"/>
  <path d="M278 -322 H380 Q404 -318 410 -276 V-246 H278 Z" fill="${GLASS}"/>
  <path d="M300 -200 H420 M300 -180 H420" stroke="#8f8a80" stroke-width="2"/>
  <g id="tkBed">
    <path d="M-430 -140 L-440 -330 L236 -330 L248 -140 Z" fill="#c9c4ba" stroke="#8f8a80" stroke-width="2"/>
    <path d="M-330 -330 V-140 M-170 -330 V-140 M-10 -330 V-140 M140 -330 V-140" stroke="#a8a399" stroke-width="3"/>
    <path d="M-424 -330 Q-200 -410 30 -372 Q160 -352 228 -330 Z" fill="${EARTH}"/>
  </g>
</g>`;

const roller = `
<g transform="translate(5100 0)">
  <g id="rlBody">
    <path d="M-290 -100 V-206 H-70 L-30 -132 L90 -150 L104 -100 Z" fill="${BODY}" stroke="${BODY_D}" stroke-width="2"/>
    <path d="M-230 -206 V-376 M-80 -206 V-376" stroke="${DARK}" stroke-width="12"/>
    <rect x="-250" y="-392" width="190" height="20" fill="${DARK}" stroke="${LINE}" stroke-width="2"/>
    <path d="M-222 -360 H-88 V-216 H-222 Z" fill="${GLASS}" opacity=".7"/>
    ${wheel(-200, -64, 64)}
    <g id="rlDrum">
      <circle cx="170" cy="-84" r="84" fill="#3a3631" stroke="${LINE}" stroke-width="3"/>
      <path d="M86 -84 H254 M170 -168 V0 M110 -144 L230 -24 M230 -144 L110 -24" stroke="${LINE}" stroke-opacity=".35" stroke-width="2"/>
      <circle cx="170" cy="-84" r="16" fill="${LINE}"/>
    </g>
  </g>
</g>`;

const mounds = `
  <path d="M900 0 Q1050 -120 1220 0 Z M2060 0 Q2200 -150 2380 0 Z M3220 0 Q3330 -90 3460 0 Z M4500 0 Q4640 -130 4820 0 Z" fill="#3b2e1f"/>
  <path d="M-2000 0 H7200" stroke="${LINE}" stroke-opacity=".45" stroke-width="2"/>`;

const svgMarkup = `
<svg class="parc__svg" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#14120f"/><stop offset=".55" stop-color="#3a2a14"/><stop offset=".8" stop-color="#8a6526"/><stop offset="1" stop-color="#c59a4a"/>
    </linearGradient>
    <linearGradient id="pGround" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a2016"/><stop offset="1" stop-color="#121110"/>
    </linearGradient>
    <linearGradient id="pGlass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e6c06c" stop-opacity=".55"/><stop offset="1" stop-color="#1c1a17" stop-opacity=".9"/>
    </linearGradient>
  </defs>
  <rect class="p-sky" fill="url(#pSky)"/>
  <g id="pFar"><path fill="#241b12" d="M-3000 0 L-2600 -260 L-2200 -120 L-1700 -330 L-1200 -150 L-600 -300 L0 -110 L600 -280 L1200 -140 L1800 -320 L2400 -160 L3000 -300 L3600 -120 L4200 -290 L4800 -150 L5400 -310 L6000 -130 L6600 -260 L7400 -100 V400 H-3000 Z"/></g>
  <g id="pWorld">
    <rect x="-3000" y="0" width="11000" height="900" fill="url(#pGround)"/>
    ${mounds}
    ${excavator}${loader}${truck}${roller}
    ${gate}
  </g>
  <text class="p-watermark" id="pWatermark">GKH DIGITAL</text>
</svg>`;

// Cadre cheie pentru cameră: p = progresul derulării (0..1), x/y = punctul urmărit, s = zoom relativ
const CAM = [
  { p: 0.00, x: -120, y: -260, s: 0.72 },
  { p: 0.08, x: -60, y: -260, s: 0.8 },
  { p: 0.17, x: 0, y: -230, s: 1.9 },
  { p: 0.25, x: 1560, y: -260, s: 1.0 },
  { p: 0.38, x: 1600, y: -300, s: 0.98 },
  { p: 0.47, x: 2740, y: -240, s: 1.02 },
  { p: 0.58, x: 2760, y: -250, s: 1.0 },
  { p: 0.67, x: 3920, y: -250, s: 0.95 },
  { p: 0.79, x: 3880, y: -280, s: 0.95 },
  { p: 0.88, x: 5060, y: -220, s: 1.05 },
  { p: 1.00, x: 5260, y: -220, s: 1.05 },
];

const STEPS = [
  { at: 0.00, eyebrow: 'Parc de utilaje', title: 'Bine ai venit la VANGHELIS TRANS.', body: 'Derulează pentru a intra în parcul de utilaje.' },
  { at: 0.20, eyebrow: 'Excavatoare', title: 'Săpături, fundații, terasamente.', body: 'Utilaje cu operator pentru lucrări de excavații de orice dimensiune.' },
  { at: 0.42, eyebrow: 'Încărcătoare', title: 'Încărcare și manipulare.', body: 'Pământ, moloz și agregate mutate rapid pe amplasament.' },
  { at: 0.62, eyebrow: 'Autobasculante', title: 'Transport de materiale.', body: 'Pământ, moloz, balast, nisip și pietriș.' },
  { at: 0.83, eyebrow: 'Compactoare', title: 'Drumuri și platforme.', body: 'Cilindrare și compactare pentru căi de acces solide.' },
];

// Texte pentru varianta video (poarta -> excavator -> încărcător)
const VIDEO_STEPS = [
  { at: 0.00, eyebrow: 'Parc de utilaje', title: 'Bine ai venit în parcul de utilaje.', body: 'Derulează pentru a intra.' },
  { at: 0.25, eyebrow: 'Excavatoare', title: 'Săpături, fundații, terasamente.', body: 'Utilaje cu operator pentru lucrări de excavații de orice dimensiune.' },
  { at: 0.62, eyebrow: 'Încărcătoare', title: 'Încărcare și manipulare.', body: 'Pământ, moloz și agregate mutate rapid pe amplasament.' },
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;

function camAt(p) {
  let i = 0;
  while (i < CAM.length - 2 && p > CAM[i + 1].p) i++;
  const a = CAM[i], b = CAM[i + 1];
  const t = ease(clamp((p - a.p) / (b.p - a.p)));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t) };
}

export function initParc(root) {
  if (!root) return;
  const stage = root.querySelector('.parc__stage');
  stage.insertAdjacentHTML('afterbegin', svgMarkup);
  const svg = stage.querySelector('svg');
  const $ = (id) => svg.getElementById(id);
  const world = $('pWorld'), far = $('pFar'), sky = svg.querySelector('.p-sky');
  const el = {
    gate: $('pGate'), barrier: $('pBarrier'),
    boom: $('exBoom'), arm: $('exArm'), bucket: $('exBucket'),
    ldArm: $('ldArm'), ldBucket: $('ldBucket'),
    bed: $('tkBed'), spill: $('tkSpill'),
    rl: $('rlBody'), drum: $('rlDrum'), wm: $('pWatermark'),
  };
  const cap = root.querySelector('.parc__caption');
  const capEyebrow = cap.querySelector('.parc__eyebrow');
  const capTitle = cap.querySelector('.parc__title');
  const capBody = cap.querySelector('.parc__body');
  const bar = root.querySelector('.parc__progress span');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let W = 0, H = 0, target = 0, cur = 0, raf = null, step = -1;
  let video = null, steps = STEPS;

  const resize = () => {
    W = stage.clientWidth; H = stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    sky.setAttribute('width', W); sky.setAttribute('height', H);
    el.wm.setAttribute('x', W - 24); el.wm.setAttribute('y', (W / H < 1 ? 64 : 84) + 22);
  };

  const caption = (p) => {
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    let k = 0;
    while (k < steps.length - 1 && p >= steps[k + 1].at) k++;
    if (k !== step) {
      step = k;
      cap.classList.remove('is-in');
      void cap.offsetWidth;
      capEyebrow.textContent = steps[k].eyebrow;
      capTitle.textContent = steps[k].title;
      capBody.textContent = steps[k].body;
      cap.classList.add('is-in');
    }
  };

  // Video: o singură căutare (seek) activă odată; următoarea pornește după „seeked”
  let wantT = 0, seeking = false;
  const seek = () => {
    if (seeking || Math.abs(video.currentTime - wantT) < 0.01) return;
    seeking = true;
    video.currentTime = wantT;
  };

  const render = (p) => {
    if (video) {
      wantT = p * Math.max(0, video.duration - 0.05);
      seek();
      caption(p);
      return;
    }
    // pe ecrane înguste încadrăm ~820 unități, pe cele late ~1500
    const base = W / H < 1 ? W / 720 : Math.min(W / 1500, H / 860);
    const c = camAt(p);
    const s = base * c.s;
    const fx = W * 0.5, fy = H * (W / H < 1 ? 0.52 : 0.6);
    world.setAttribute('transform', `translate(${fx - c.x * s} ${fy - c.y * s}) scale(${s})`);
    const gy = fy - c.y * s; // poziția liniei solului pe ecran
    far.setAttribute('transform', `translate(${fx - c.x * s * 0.35} ${gy}) scale(${s * 0.9})`);

    el.barrier.setAttribute('transform', `rotate(${-80 * seg(p, 0.04, 0.11)} -310 -119)`);
    el.gate.setAttribute('opacity', (1 - seg(p, 0.13, 0.19)).toFixed(3));

    const ex = seg(p, 0.26, 0.38);
    el.boom.setAttribute('transform', `rotate(${-16 * ex} 100 -150)`);
    el.arm.setAttribute('transform', `rotate(${-38 * ex} 380 -420)`);
    el.bucket.setAttribute('transform', `rotate(${-55 * ex} 470 -122)`);

    const ld = seg(p, 0.48, 0.58);
    el.ldArm.setAttribute('transform', `rotate(${-34 * ld} 44 -206)`);
    el.ldBucket.setAttribute('transform', `rotate(${26 * ld} 288 -94)`);

    const tk = seg(p, 0.68, 0.79);
    el.bed.setAttribute('transform', `rotate(${-27 * tk} -430 -140)`);
    const sp = seg(p, 0.73, 0.8);
    el.spill.setAttribute('opacity', sp.toFixed(3));
    el.spill.setAttribute('transform', `translate(-480 0) scale(${0.4 + sp * 0.8} ${0.3 + sp * 0.9}) translate(480 0)`);

    const rl = seg(p, 0.86, 1);
    const dx = -160 + rl * 360;
    el.rl.setAttribute('transform', `translate(${dx} 0)`);
    el.drum.setAttribute('transform', `rotate(${(dx / 84) * 57.3} 170 -84)`);

    caption(p);
  };

  const progress = () => {
    const r = root.getBoundingClientRect();
    const total = root.offsetHeight - H;
    return clamp(-r.top / (total || 1));
  };

  const tick = () => {
    cur += (target - cur) * (reduce.matches ? 1 : 0.14);
    if (Math.abs(target - cur) < 0.0004) cur = target;
    render(cur);
    raf = cur === target ? null : requestAnimationFrame(tick);
  };
  const onScroll = () => {
    target = progress();
    if (!raf) raf = requestAnimationFrame(tick);
  };

  resize();
  target = cur = progress();
  render(cur);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { resize(); render(cur); });

  // Videoul se descarcă întreg (Blob) ca derularea înapoi să fie fluidă; SVG-ul rămâne până e gata.
  if (parcCfg.video && W >= parcCfg.minVideoWidth && !reduce.matches && window.fetch) {
    fetch(parcCfg.video)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((blob) => {
        const v = document.createElement('video');
        v.className = 'parc__video';
        v.muted = true; v.playsInline = true; v.preload = 'auto';
        v.setAttribute('aria-hidden', 'true');
        v.addEventListener('seeked', () => { seeking = false; seek(); });
        v.addEventListener('loadeddata', () => {
          video = v; steps = VIDEO_STEPS; step = -1;
          root.classList.add('is-video');
          render(cur);
        }, { once: true });
        v.src = URL.createObjectURL(blob);
        stage.insertBefore(v, svg);
      })
      .catch(() => {});
  }
}
