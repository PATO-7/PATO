/* Headless verification for pato-intro.html (jsdom + local GSAP build). */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('pato-intro.html', 'utf8');
const gsapSrc = fs.readFileSync('vendor/gsap.min.js', 'utf8');
const m = html.match(/<script>\n(\(function \(\)[\s\S]*?)<\/script>/);
if (!m) throw new Error('intro IIFE not found in pato-intro.html');

function makeDom(opts) {
  const dom = new JSDOM(html, Object.assign({
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'https://example.com/'
  }, opts));
  const w = dom.window;
  w.eval(gsapSrc);
  return { dom, w };
}

let failures = 0;
function check(name, cond) {
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
  if (!cond) failures++;
}

(async function () {
  /* ---------- TEST 1: full path builds overlay, locks scroll ---------- */
  const { w } = makeDom();
  w.eval(m[1]);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  await new Promise(r => setTimeout(r, 50));

  const el = w.document.getElementById('pato-intro');
  check('overlay exists', !!el);
  check('60 tick marks', w.document.querySelectorAll('#pi-ticks line').length === 60);
  check('4 letters PATO', w.document.querySelectorAll('.pi-letter').length === 4);
  check('SVG viewBox present', w.document.querySelector('.pi-dial') &&
        w.document.querySelector('.pi-dial').getAttribute('viewBox') === '0 0 200 200');
  check('hands + second hand built', !!w.document.getElementById('pi-hour') &&
        !!w.document.getElementById('pi-minute') && !!w.document.getElementById('pi-second'));
  check('defs gradient built (innerHTML on SVG works)',
        w.document.querySelectorAll('#pi-dial defs stop').length === 3);
  check('second-hand parts built', w.document.querySelectorAll('#pi-second line, #pi-second circle').length === 2);
  check('scroll locked during intro',
        w.document.documentElement.classList.contains('pato-intro-lock'));
  check('sessionStorage flag set', w.sessionStorage.getItem('patoIntroSeen') === '1');

  /* ---------- TEST 2: skip button removes overlay + unlocks scroll ---------- */
  el.querySelector('.pi-skip').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 700));
  check('skip -> overlay removed from DOM', !w.document.getElementById('pato-intro'));
  check('skip -> scroll unlocked',
        !w.document.documentElement.classList.contains('pato-intro-lock'));

  /* ---------- TEST 3: second load in same session shows nothing ---------- */
  const t3 = makeDom();
  t3.w.sessionStorage.setItem('patoIntroSeen', '1');   // simulate earlier visit
  t3.w.eval(m[1]);
  t3.w.document.dispatchEvent(new t3.w.Event('DOMContentLoaded'));
  await new Promise(r => setTimeout(r, 50));
  check('already-seen session -> no overlay',
        !t3.w.document.getElementById('pato-intro'));

  /* ---------- TEST 4: reduced motion path ---------- */
  const rm = makeDom({ userCss: '@media (prefers-reduced-motion: reduce){}' });
  // jsdom matchMedia stub: force matches=true
  rm.w.matchMedia = q => ({ matches: /reduced-motion/.test(q), media: q,
                            addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
  rm.w.eval(m[1]);
  rm.w.document.dispatchEvent(new rm.w.Event('DOMContentLoaded'));
  await new Promise(r => setTimeout(r, 50));
  const rEl = rm.w.document.getElementById('pato-intro');
  check('reduced motion -> overlay shown', !!rEl);
  check('reduced motion -> skip hidden', rEl && rEl.querySelector('.pi-skip').style.display === 'none');
  await new Promise(r => setTimeout(r, 1000));
  check('reduced motion -> removed after ~0.8s', !rm.w.document.getElementById('pato-intro'));
  check('reduced motion -> scroll restored',
        !rm.w.document.documentElement.classList.contains('pato-intro-lock'));

  /* ---------- TEST 5: boot error must not trap the page ---------- */
  const bad = makeDom();
  bad.w.eval(m[1].replace("var el = buildOverlay();",
                          "document.body.appendChild({ dataset:{}, classList:{remove(){}}, querySelector(){return null}, remove(){} } ); var el = (function(){ throw new Error('boom'); })();"));
  bad.w.document.dispatchEvent(new bad.w.Event('DOMContentLoaded'));
  await new Promise(r => setTimeout(r, 50));
  check('error in boot -> no lock left behind',
        !bad.w.document.documentElement.classList.contains('pato-intro-lock'));

  /* ---------- TEST 6: natural completion (~3.5s) ---------- */
  const nat = makeDom();
  nat.w.eval(m[1]);
  nat.w.document.dispatchEvent(new nat.w.Event('DOMContentLoaded'));
  await new Promise(r => setTimeout(r, 4300)); // timeline 3.5s + 0.3s fade + margin
  check('full playthrough -> overlay removed by itself',
        !nat.w.document.getElementById('pato-intro'));
  check('full playthrough -> scroll restored',
        !nat.w.document.documentElement.classList.contains('pato-intro-lock'));

  console.log(failures ? '\n' + failures + ' FAILURE(S)' : '\nALL TESTS PASSED');
  process.exit(failures ? 1 : 0);
})();
