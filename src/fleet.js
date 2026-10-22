// Categorii de utilaje. Pentru versiunea finală: adăugați fotografii reale (image),
// iar detaliile tehnice se pot adăuga în câmpul `note`.

export const groups = [
  { id: 'all', label: 'Toate' },
  { id: 'excavare', label: 'Excavare' },
  { id: 'incarcare', label: 'Încărcare' },
  { id: 'demolare', label: 'Demolare' },
  { id: 'compactare', label: 'Compactare' },
  { id: 'transport', label: 'Transport' },
];

export const machines = [
  {
    id: 'excavatoare',
    name: 'Excavatoare',
    group: 'excavare',
    note: 'Pentru excavații, fundații și lucrări de terasamente.',
    image: { src: 'img/bucket-detail-640.webp', srcset: 'img/bucket-detail-640.webp 640w , img/bucket-detail-1200.webp 1200w' },
    icon: 'excavator',
  },
  {
    id: 'buldoexcavatoare',
    name: 'Buldoexcavatoare',
    group: 'excavare',
    note: 'Cu braț telescopic, picon și furci, în funcție de configurație.',
    icon: 'backhoe',
  },
  {
    id: 'miniexcavatoare',
    name: 'Miniexcavatoare',
    group: 'excavare',
    note: 'Pentru lucrări în spații restrânse, cu accesorii adaptate lucrării.',
    icon: 'miniexcavator',
  },
  {
    id: 'miniincarcatoare',
    name: 'Miniîncărcătoare',
    group: 'incarcare',
    note: 'Pentru încărcare, manipulare și curățenie pe amplasament.',
    icon: 'skidsteer',
  },
  {
    id: 'ciocane-hidraulice',
    name: 'Ciocane hidraulice',
    group: 'demolare',
    note: 'Pentru spargerea betonului, a rocii și demolări controlate.',
    icon: 'breaker',
  },
  {
    id: 'cilindri-compactori',
    name: 'Cilindri compactori',
    group: 'compactare',
    note: 'Pentru compactarea drumurilor și a platformelor.',
    icon: 'roller',
  },
  {
    id: 'minicilindri-compactori',
    name: 'Minicilindri compactori',
    group: 'compactare',
    note: 'Pentru alei, trotuare și suprafețe mai mici.',
    icon: 'miniroller',
  },
  {
    id: 'autobasculante',
    name: 'Autobasculante',
    group: 'transport',
    note: 'Pentru transport de pământ, moloz și agregate.',
    icon: 'tipper',
  },
];

// Pictograme liniare (SVG), desenate pe o grilă 96×56.
const s = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
export const icons = {
  excavator: `<svg viewBox="0 0 96 56" ${s}><rect x="10" y="44" width="40" height="7" rx="3.5"/><circle cx="15" cy="47.5" r="1.6"/><circle cx="45" cy="47.5" r="1.6"/><path d="M12 44v-9h30v9"/><path d="M28 35V24h12l3 11"/><path d="M31 27h7"/><path d="M42 30 60 9l14 7"/><path d="M74 16 78 34"/><path d="M78 34c-6 0-9 4-8 9 4 1 9 0 12-3l-4-6"/></svg>`,
  backhoe: `<svg viewBox="0 0 96 56" ${s}><circle cx="24" cy="44" r="8"/><circle cx="62" cy="46" r="6"/><path d="M14 40V30h22V16h16l4 14h14v10"/><path d="M40 20h10l2 8H40z"/><path d="M70 32h10l6 12h-12"/><path d="M14 34 6 20l-4 10"/><path d="M6 20 4 12"/><path d="M4 12c-2 4 0 8 4 8"/></svg>`,
  miniexcavator: `<svg viewBox="0 0 96 56" ${s}><rect x="22" y="44" width="28" height="7" rx="3.5"/><path d="M24 44v-7h22v7"/><path d="M32 37V27h10l2 10"/><path d="M44 32 56 18l10 5"/><path d="M66 23l2 13"/><path d="M68 36c-5 0-7 3-6 7 3 1 7 0 9-2l-3-5"/></svg>`,
  skidsteer: `<svg viewBox="0 0 96 56" ${s}><circle cx="30" cy="45" r="6"/><circle cx="52" cy="45" r="6"/><path d="M22 40V22l8-6h14l6 8v16"/><path d="M30 20h12l4 6H30z"/><path d="M50 26l14 4 4 10"/><path d="M68 40h10l-2-10h-8"/></svg>`,
  breaker: `<svg viewBox="0 0 96 56" ${s}><path d="M22 10l18 6"/><path d="M40 16l-4 14 6 2 4-14z"/><path d="M36 30l-2 4h10l-2-4"/><path d="M39 34v10"/><path d="M37 44l2 6 2-6"/><path d="M30 52h20" stroke-dasharray="2 3"/><path d="M54 40l6-4M56 46l8-2M24 42l-6-3"/></svg>`,
  roller: `<svg viewBox="0 0 96 56" ${s}><circle cx="24" cy="40" r="11"/><circle cx="24" cy="40" r="4"/><circle cx="68" cy="44" r="7"/><path d="M35 40h26"/><path d="M14 28h20l4-14h18l4 14h16v10"/><path d="M42 16v10h12V16"/></svg>`,
  miniroller: `<svg viewBox="0 0 96 56" ${s}><rect x="22" y="38" width="16" height="12" rx="6"/><rect x="56" y="38" width="16" height="12" rx="6"/><path d="M38 44h18"/><path d="M28 38v-8h38v8"/><path d="M42 30V18h12v12"/><path d="M42 18h12"/></svg>`,
  tipper: `<svg viewBox="0 0 96 56" ${s}><circle cx="22" cy="45" r="6"/><circle cx="58" cy="45" r="6"/><circle cx="72" cy="45" r="6"/><path d="M8 40V28h6l6-12h12v24"/><path d="M14 28h12"/><path d="M32 40h56"/><path d="M34 34l4-18h50l-4 18z"/><path d="M44 22h34"/></svg>`,
};
