/* PATO sample catalogue — 12 watches across 3 series.
   Images are generated SVG data-URIs (chiaroscuro gradients) so the site
   works offline with zero external assets. */

(function () {
  const PAL = {
    Obsidian:        { case: '#17181c', dial: '#0A0A0B', accent: '#B8964E', strap: '#101013' },
    Ember:           { case: '#5C1A1B', dial: '#1A1816', accent: '#E8DCC0', strap: '#3a1414' },
    Lunar:           { case: '#B8964E', dial: '#E8DCC0', accent: '#5C1A1B', strap: '#8a7350' }
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
    ['Obsidian Nocturne', 'OB-4201', 'Obsidian', 96000, 42, 'Obsidian steel', 'Alligator', 'Night falls once; it keeps it forever.'],
    ['Obsidian Vantablack', 'OB-4202', 'Obsidian', 88000, 40, 'Obsidian steel', 'Steel bracelet', 'A dial cut from a moonless hour.'],
    ['Obsidian Gallery', 'OB-4203', 'Obsidian', 74000, 38, 'Obsidian steel', 'Calf leather', 'For rooms where light walks softly.'],
    ['Obsidian Meridian', 'OB-4204', 'Obsidian', 112000, 42, 'Rose gold', 'Alligator', 'Two hemispheres, one heartbeat.'],
    ['Ember Candlelight', 'EM-3801', 'Ember', 68000, 38, 'Rose gold', 'Calf leather', 'The flame remembers what the day forgets.'],
    ['Ember Oxblood', 'EM-3802', 'Ember', 84000, 40, 'Obsidian steel', 'Alligator', 'A quiet fire under lacquered dusk.'],
    ['Ember Kiln', 'EM-3803', 'Ember', 56000, 36, 'Champagne gold', 'Calf leather', 'Fired slowly, worn quickly through years.'],
    ['Ember Hearth', 'EM-3804', 'Ember', 61000, 40, 'Rose gold', 'Steel bracelet', 'Warm as a hand on a cold brass clock.'],
    ['Lunar_PHASE I', 'LU-4001', 'Lunar', 128000, 40, 'Champagne gold', 'Alligator', 'It counts the sky in silver fractions.'],
    ['Lunar Crescent', 'LU-4002', 'Lunar', 98000, 38, 'Champagne gold', 'Calf leather', 'A sliver of evening, pinned to the wrist.'],
    ['Lunar Eclipse', 'LU-4003', 'Lunar', 145000, 42, 'Obsidian steel', 'Alligator', 'When shadows borrow the sun’s watch.'],
    ['Lunar Tide', 'LU-4004', 'Lunar', 72000, 36, 'Rose gold', 'Steel bracelet', 'The sea keeps its hours elsewhere.']
  ];

  window.PATO_PRODUCTS = RAW.map((r, i) => ({
    id: 'p' + (i + 1),
    name: r[0], ref: r[1], collection: r[2], priceEGP: r[3], size: r[4],
    material: r[5], strap: r[6], poem: r[7],
    soldOut: i === 10, // Lunar Eclipse — demonstrates "Notify me"
    colors: ['#0A0A0B', '#B8964E', '#5C1A1B'],
    images: [watchSVG({ collection: r[2] }, 40), watchSVG({ collection: r[2] }, 165), watchSVG({ collection: r[2] }, 285)],
    specs: [
      ['Movement', 'Cal. PT-' + (100 + i) + ' · manual wind · 212 parts'],
      ['Power reserve', '72 hours'],
      ['Case', r[4] + ' mm · ' + r[5] + ' · sapphire crystal'],
      ['Water resistance', '50 m'],
      ['Finishing', 'Hand-bevelled bridges · 312 atelier hours']
    ]
  }));

  window.PATO_JOURNAL = [
    ['On Silence', 'Why our escapements are regulated by ear, not machine.', 'I'],
    ['Eleven Passes', 'The lacquer ritual that gives an Ember dial its dusk.', 'II'],
    ['A Moon You Can Wear', 'Notes from building the Lunar phase disc.', 'III']
  ].map((j, i) => ({ title: j[0], blurb: j[1], num: j[2], img: watchSVG({ collection: ['Obsidian', 'Ember', 'Lunar'][i] }, i * 90) }));
})();
