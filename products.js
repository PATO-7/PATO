/* PATO catalogue — watches with real photos where available, SVG placeholders otherwise. */
(function () {
  const PAL = {
    Obsidian: { case: '#17181c', dial: '#0A0A0B', accent: '#B8964E', strap: '#101013' },
    Ember:    { case: '#5C1A1B', dial: '#1A1816', accent: '#E8DCC0', strap: '#3a1414' },
    Lunar:    { case: '#B8964E', dial: '#E8DCC0', accent: '#5C1A1B', strap: '#8a7350' }
  };

  function watchSVG(p, angle) {
    angle = angle || 0;
    const c = PAL[p.collection] || PAL.Obsidian;
    const a = (angle * Math.PI) / 180;
    const hx = 100 + 34 * Math.sin(a), hy = 100 - 34 * Math.cos(a);
    const mx = 100 + 50 * Math.sin(a * 1.4), my = 100 - 50 * Math.cos(a * 1.4);
    let marks = '';
    for (let i = 0; i < 12; i++) {
      const t = (i * 30 * Math.PI) / 180;
      marks += `<line x1="${100 + 62 * Math.sin(t)}" y1="${100 - 62 * Math.cos(t)}" x2="${100 + 68 * Math.sin(t)}" y2="${100 - 68 * Math.cos(t)}" stroke="${c.accent}" stroke-width="2"/>`;
    }
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">` +
      `<defs><radialGradient id="g" cx="35%" cy="30%"><stop offset="0%" stop-color="#2a2a2e"/><stop offset="100%" stop-color="#0A0A0B"/></radialGradient></defs>` +
      `<rect width="200" height="260" fill="url(#g)"/>` +
      `<path d="M78 8 h44 v30 h-44 z M78 222 h44 v30 h-44 z" fill="${c.strap}"/>` +
      `<circle cx="100" cy="130" r="86" fill="${c.case}"/>` +
      `<circle cx="100" cy="130" r="86" fill="none" stroke="${c.accent}" stroke-width="1.4" opacity=".8"/>` +
      `<circle cx="100" cy="130" r="70" fill="${c.dial}"/>` +
      `<g transform="translate(0,30)">${marks}</g>` +
      `<line x1="100" y1="130" x2="${hx}" y2="${hy + 30}" stroke="${c.accent}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<line x1="100" y1="130" x2="${mx}" y2="${my + 30}" stroke="#EDE6D6" stroke-width="2" stroke-linecap="round"/>` +
      `<circle cx="100" cy="130" r="4" fill="${c.accent}"/>` +
      `<rect x="184" y="122" width="10" height="16" rx="3" fill="${c.accent}"/>` +
      `</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  const RAW = [
    { id: 'signature', name: 'PATO Signature', ref: 'PT-0800', collection: 'Obsidian', price: 800,
      photo: 'images/watch.webp',
      desc: 'The house classic — a whisper of gold on obsidian, made to be worn every day and remembered forever.',
      specs: { Movement: 'Automatic, 38h reserve', Case: '40mm steel', Strap: 'Black leather', Water: '50m' } },
    { id: 'noir-royale', name: 'Noir Royale', ref: 'PT-1101', collection: 'Obsidian', price: 1350,
      desc: 'Midnight polished to a mirror. The dial holds light the way still water holds the moon.',
      specs: { Movement: 'Automatic, 42h reserve', Case: '41mm steel', Strap: 'Alligator', Water: '100m' } },
    { id: 'ember-hour', name: 'Ember Hour', ref: 'PT-2210', collection: 'Ember', price: 1180,
      desc: 'Oxblood warmth caught in a brass frame — for those who wear fire quietly.',
      specs: { Movement: 'Automatic, 40h reserve', Case: '39mm bronze', Strap: 'Cognac leather', Water: '50m' } },
    { id: 'lunar-tide', name: 'Lunar Tide', ref: 'PT-3305', collection: 'Lunar', price: 1490,
      desc: 'Champagne dial under a pale gold sky. It keeps time like the sea keeps its promises.',
      specs: { Movement: 'Automatic, 45h reserve', Case: '38mm gold-tone', Strap: 'Milanese', Water: '30m' } },
    { id: 'ash-eclipse', name: 'Ash Eclipse', ref: 'PT-1140', collection: 'Obsidian', price: 980,
      desc: 'The moment between light and dark, frozen at three o\u2019clock.',
      specs: { Movement: 'Quartz precision', Case: '40mm steel', Strap: 'Rubber', Water: '100m' } },
    { id: 'golden-quiet', name: 'Golden Quiet', ref: 'PT-3312', collection: 'Lunar', price: 1620,
      desc: 'Nothing shouts here. Only gold, patience, and the softest tick in the atelier.',
      specs: { Movement: 'Automatic, 50h reserve', Case: '37mm gold-tone', Strap: 'Leather', Water: '30m' } }
  ];

  window.PATO_PRODUCTS = RAW.map(p => ({
    ...p,
    images: p.photo
      ? [p.photo, p.photo, p.photo]
      : [watchSVG(p, 30), watchSVG(p, 150), watchSVG(p, 260)]
  }));
})();
