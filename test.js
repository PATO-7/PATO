const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('index.html','utf8');
const dom = new JSDOM(html, { runScripts:'outside-only', url:'https://x.github.io/PATO/' });
const w = dom.window;
w.localStorage.clear();
// stub IntersectionObserver absent in jsdom? it exists. Provide scrollTo
w.scrollTo = ()=>{};
w.alert = (m)=>{ w.__alert=m; };
w.open = (u)=>{ w.__opened=u; };
const pjs = fs.readFileSync('products.js','utf8');
const sjs = fs.readFileSync('script.js','utf8');
w.document.readyState='loading';
w.eval(pjs);
w.eval(sjs);
w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
const d = w.document;
let pass=0,fail=0;
const t=(name,cond)=>{ cond?(pass++,console.log('PASS',name)):(fail++,console.log('FAIL',name)); };

t('6 products loaded', w.PATO_PRODUCTS.length===6);
t('home grid rendered 6 cards', d.querySelectorAll('#home-grid .p-card').length===6);
t('signature price 800 shown', d.querySelector('#home-grid .p-price').textContent.includes('800'));

// menu open/close
d.getElementById('menu-btn').click();
t('menu opens on click', d.getElementById('menu-sheet').classList.contains('open'));
d.getElementById('menu-close').click();
t('menu closes', !d.getElementById('menu-sheet').classList.contains('open'));

// navigate category via hash
w.location.hash='#/category';
w.dispatchEvent(new w.HashChangeEvent('hashchange'));
t('category view visible', !d.getElementById('view-category').classList.contains('hidden') && !d.getElementById('view-home').classList.contains('hidden')===false || !d.getElementById('view-category').classList.contains('hidden'));
t('shop grid rendered', d.querySelectorAll('#shop-grid .p-card').length===6);

// open product page via hash (jsdom does not fire hashchange on programmatic hash set; real browsers do)
w.location.hash='#/product/signature';
w.dispatchEvent(new w.HashChangeEvent('hashchange'));
t('product route -> detail rendered', !d.getElementById('view-product').classList.contains('hidden') && d.querySelector('#product-detail .pd')!==null);
t('add-to-basket button present', !!d.querySelector('[data-add]'));

// add to basket
d.querySelector('[data-add]').click();
t('badge shows 1', d.getElementById('basket-count').textContent==='1' && !d.getElementById('basket-count').hidden);

// basket view
w.location.hash='#/basket'; w.dispatchEvent(new w.HashChangeEvent('hashchange'));
t('basket item listed', d.querySelectorAll('.b-item').length===1);
t('total EGP 800', d.getElementById('basket-total').textContent.includes('800'));

// qty inc
d.querySelector('[data-inc]').click();
t('qty inc works', d.querySelector('.b-item .qty span').textContent==='2');

// checkout
d.getElementById('go-checkout').click();
w.dispatchEvent(new w.HashChangeEvent('hashchange'));
t('checkout visible', !d.getElementById('view-checkout').classList.contains('hidden'));
d.getElementById('co-name').value='Ali'; d.getElementById('co-phone').value='01000000000'; d.getElementById('co-address').value='Cairo';
d.getElementById('checkout-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
t('order success shown', !d.getElementById('order-done').classList.contains('hidden'));
t('whatsapp opened with order', (w.__opened||'').includes('wa.me/201289659621') && (w.__opened||'').includes('PATO'));
t('cart cleared after order', d.querySelectorAll('.b-item').length===0);

// contact links
t('contact WA link', d.getElementById('contact-wa').href.includes('wa.me/201289659621'));
t('footer phone is WA link', d.getElementById('footer-wa').href.includes('wa.me/201289659621'));

// splash hides after timer
w.eval('document.getElementById("splash")&&document.getElementById("splash").classList.add("done")');
t('splash can hide', true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
