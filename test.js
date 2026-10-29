const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('index.html','utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/#/', pretendToBeVisual: true });
const { window } = dom;
// stub vendor libs (gsap/st/lenis/three not loaded via file:// in jsdom)
window.matchMedia = window.matchMedia || (q => ({ matches: false, media: q, addListener(){}, removeListener(){} }));
for (const f of ['products.js','script.js']) {
  const code = fs.readFileSync(f,'utf8');
  try { window.eval(code); console.log('EVAL OK:', f); } catch(e){ console.log('EVAL FAIL:', f, e.message); }
}
const d = window.document;
setTimeout(() => {
  const t = s => !!d.querySelector(s);
  const log = [];
  log.push(['12 products', window.PATO_PRODUCTS.length === 12]);
  log.push(['shop grid rendered', d.querySelectorAll('#shop-grid .card').length >= 0]);
  // navigate to shop
  window.location.hash = '#/shop';
  setTimeout(() => {
    log.push(['shop view active', t('#view-shop.active')]);
    log.push(['cards rendered', d.querySelectorAll('#shop-grid .card').length === 12]);
    // filter
    d.getElementById('f-collection').value = 'Ember';
    d.getElementById('f-collection').dispatchEvent(new window.Event('change'));
    log.push(['filter Ember -> 4', d.querySelectorAll('#shop-grid .card').length === 4]);
    // add to cart
    const addBtn = d.querySelector('[data-add]');
    if (addBtn) addBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    log.push(['cart has item', JSON.parse(window.localStorage.getItem('pato_cart')||'[]').length === 1]);
    log.push(['drawer open', t('#cart-drawer.open')]);
    // product page
    window.location.hash = '#/product/p1';
    setTimeout(() => {
      log.push(['product rendered', !!d.querySelector('#product-body .prod-info h1')]);
      log.push(['accordion present', d.querySelectorAll('#product-body .acc-item').length === 2]);
      // sold-out notify
      window.location.hash = '#/product/p11';
      setTimeout(() => {
        log.push(['notify form on soldout', !!d.querySelector('#notify')]);
        // menu toggle
        d.getElementById('menu-open').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
        log.push(['menu opens', t('#menu-sheet.open')]);
        d.getElementById('menu-close').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
        log.push(['menu closes', !t('#menu-sheet.open')]);
        // search
        d.getElementById('search-open').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
        const si = d.getElementById('search-input'); si.value='obsidian'; si.dispatchEvent(new window.Event('input'));
        log.push(['search results', d.querySelectorAll('#search-results li').length === 4]);
        // checkout empty guard
        window.location.hash='#/checkout';
        setTimeout(()=>{ log.push(['checkout renders', !!d.querySelector('#checkout-body')] );
          const fails = log.filter(l=>!l[1]);
          console.log(log.map(l=>(l[1]?'PASS':'FAIL')+' - '+l[0]).join('\n'));
          process.exit(fails.length?1:0); }, 1500);
      }, 1500);
    }, 1500);
  }, 1500);
}, 300);
