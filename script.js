/* ================= PATO — app logic (dark, gentle, mobile-first) ================= */
(function () {
  'use strict';

  const PHONE = '01289659621';
  const WA = '201289659621';
  const PRODUCTS = window.PATO_PRODUCTS || [];
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = n => 'EGP ' + Number(n).toLocaleString('en-EG');

  /* ---------- basket state ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('pato-cart') || '[]'); } catch (e) { cart = []; }
  function saveCart() { try { localStorage.setItem('pato-cart', JSON.stringify(cart)); } catch (e) {} }
  const findP = id => PRODUCTS.find(p => p.id === id);
  const total = () => cart.reduce((s, c) => s + (findP(c.id) ? findP(c.id).price * c.qty : 0), 0);

  function updateBadge() {
    const b = $('#basket-count'); if (!b) return;
    const n = cart.reduce((s, c) => s + c.qty, 0);
    b.textContent = n; b.hidden = n === 0;
  }

  /* ---------- splash: live watch hands + dust + 3s then reveal ---------- */
  function initSplash() {
    const splash = $('#splash');
    // hour markers on splash dial
    const marks = $('#sw-marks');
    if (marks) {
      let m = '';
      for (let i = 0; i < 12; i++) {
        const t = (i * 30 * Math.PI) / 180;
        m += `<line x1="${(100 + 60 * Math.sin(t)).toFixed(1)}" y1="${(130 - 60 * Math.cos(t)).toFixed(1)}" x2="${(100 + 66 * Math.sin(t)).toFixed(1)}" y2="${(130 - 66 * Math.cos(t)).toFixed(1)}" stroke="#B8964E" stroke-width="2"/>`;
      }
      marks.innerHTML = m;
    }
    // drifting gold dust particles in the light beam
    const dustBox = $('#sp-dust');
    if (dustBox && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let d = '';
      for (let i = 0; i < 26; i++) {
        const size = (Math.random() * 3.5 + 1).toFixed(1);
        d += `<span class="dust" style="left:${(Math.random() * 100).toFixed(1)}%;width:${size}px;height:${size}px;animation-duration:${(Math.random() * 5 + 4).toFixed(1)}s;animation-delay:${(Math.random() * 3).toFixed(1)}s"></span>`;
      }
      dustBox.innerHTML = d;
    }
    // sweep splash hands to current time
    const now = new Date();
    const set = (id, deg) => { const el = $('#' + id); if (el) el.setAttribute('transform', `rotate(${deg} 100 130)`); };
    set('sw-hour', (now.getHours() % 12) * 30 + now.getMinutes() * 0.5);
    set('sw-min', now.getMinutes() * 6);
    set('sw-sec', now.getSeconds() * 6);

    const hide = () => { if (splash) splash.classList.add('done'); };
    setTimeout(hide, 3000);          // exactly 3 seconds
    setTimeout(() => { if (splash) splash.remove(); }, 3700);
    window.addEventListener('click', hide, { once: true }); // tap to skip
  }

  /* ---------- routing ---------- */
  const VIEWS = ['home', 'category', 'product', 'about', 'contact', 'basket', 'checkout'];
  function showView(name) {
    if (!VIEWS.includes(name)) name = 'home';
    VIEWS.forEach(v => { const el = $('#view-' + v); if (el) el.classList.toggle('hidden', v !== name); });
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    refreshReveals();
  }
  function route() {
    const h = (location.hash || '#/').replace(/^#\//, '');
    if (h.startsWith('product/')) { renderProduct(h.split('/')[1]); showView('product'); return; }
    if (h === 'category') { renderShop(); showView('category'); return; }
    if (h === 'about') { showView('about'); return; }
    if (h === 'contact') { showView('contact'); return; }
    if (h === 'basket') { renderBasket(); showView('basket'); return; }
    if (h === 'checkout') { renderCheckout(); showView('checkout'); return; }
    showView('home');
  }

  /* ---------- product cards ---------- */
  function cardHTML(p) {
    return `<article class="p-card reveal" data-open="${p.id}" role="button" tabindex="0" aria-label="Open ${p.name}">
      <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      <div class="p-body">
        <div class="p-name">${p.name}</div>
        <div class="p-ref">${p.ref} · ${p.collection}</div>
        <div class="p-price">${money(p.price)}</div>
      </div>
    </article>`;
  }
  function renderGrid(elId) {
    const el = $('#' + elId); if (!el) return;
    el.innerHTML = PRODUCTS.map(cardHTML).join('');
  }
  const renderHome = () => renderGrid('home-grid');
  const renderShop = () => renderGrid('shop-grid');

  // delegation: click/keyboard on any card opens its page
  document.addEventListener('click', e => {
    const card = e.target.closest('[data-open]');
    if (card) location.hash = '#/product/' + card.dataset.open;
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-open]')) {
      e.preventDefault(); location.hash = '#/product/' + e.target.dataset.open;
    }
  });

  /* ---------- product detail ---------- */
  function renderProduct(id) {
    const p = findP(id); const box = $('#product-detail'); if (!box) return;
    if (!p) { box.innerHTML = '<p class="empty-note">Watch not found.</p>'; return; }
    box.innerHTML = `<div class="pd">
      <div class="pd-gallery">
        <img class="main" id="pd-main" src="${p.images[0]}" alt="${p.name}">
        <div class="pd-thumbs">${p.images.map((im, i) =>
          `<img src="${im}" class="${i === 0 ? 'on' : ''}" data-thumb="${i}" alt="View ${i + 1}">`).join('')}</div>
      </div>
      <div class="pd-info">
        <h2>${p.name}</h2>
        <div class="pd-ref">Ref ${p.ref} · ${p.collection} collection</div>
        <p class="pd-desc">${p.desc}</p>
        <div class="pd-price">${money(p.price)}</div>
        <ul class="pd-specs">${Object.entries(p.specs || {}).map(([k, v]) =>
          `<li><b>${k}</b><span>${v}</span></li>`).join('')}</ul>
        <button type="button" class="btn-gold full" data-add="${p.id}">Add to Basket</button>
      </div>
    </div>`;
    box.querySelectorAll('[data-thumb]').forEach(t => t.addEventListener('click', () => {
      const img = $('#pd-main'); if (img) img.src = p.images[t.dataset.thumb];
      box.querySelectorAll('[data-thumb]').forEach(x => x.classList.toggle('on', x === t));
    }));
    const addBtn = $('[data-add]', box);
    if (addBtn) addBtn.addEventListener('click', () => addToCart(p.id, addBtn));
  }

  /* ---------- add to basket (with fly feedback) ---------- */
  function addToCart(id, btn) {
    const line = cart.find(c => c.id === id);
    if (line) line.qty++; else cart.push({ id, qty: 1 });
    saveCart(); updateBadge(); renderBasket();
    if (btn) {
      const old = btn.textContent;
      btn.textContent = '✓ Added';
      btn.style.pointerEvents = 'none';
      setTimeout(() => { btn.textContent = old; btn.style.pointerEvents = ''; }, 900);
    }
    const bb = $('#basket-btn');
    if (bb && typeof bb.animate === 'function') { try { bb.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' }); } catch (e) {} }
  }

  /* ---------- basket view ---------- */
  function renderBasket() {
    const wrap = $('#basket-items'); if (!wrap) return;
    wrap.innerHTML = cart.map(c => {
      const p = findP(c.id); if (!p) return '';
      return `<div class="b-item">
        <img src="${p.images[0]}" alt="${p.name}">
        <div class="b-mid">
          <h4>${p.name}</h4><small>${money(p.price)}</small>
          <div class="qty">
            <button type="button" data-dec="${p.id}" aria-label="Decrease">−</button>
            <span>${c.qty}</span>
            <button type="button" data-inc="${p.id}" aria-label="Increase">+</button>
          </div>
        </div>
        <button type="button" class="b-remove" data-del="${p.id}">Remove</button>
      </div>`;
    }).join('');
    const has = cart.length > 0;
    $('#basket-foot').classList.toggle('hidden', !has);
    $('#basket-empty').classList.toggle('hidden', has);
    $('#basket-total').textContent = money(total());
  }
  document.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), del = e.target.closest('[data-del]');
    if (inc) { const l = cart.find(c => c.id === inc.dataset.inc); if (l) { l.qty++; afterCart(); } }
    if (dec) { const l = cart.find(c => c.id === dec.dataset.dec); if (l) { l.qty--; if (l.qty <= 0) cart = cart.filter(c => c !== l); afterCart(); } }
    if (del) { cart = cart.filter(c => c.id !== del.dataset.del); afterCart(); }
  });
  function afterCart() { saveCart(); updateBadge(); renderBasket(); }

  /* ---------- checkout ---------- */
  function renderCheckout() {
    $('#checkout-total').textContent = money(total());
    $('#order-done').classList.add('hidden');
    $('#checkout-form').classList.remove('hidden');
  }
  function wireCheckout() {
    const form = $('#checkout-form'); if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#co-name').value.trim(), phone = $('#co-phone').value.trim(), addr = $('#co-address').value.trim();
      if (!name || !phone || !addr) { alert('Please fill name, phone and address.'); return; }
      if (!cart.length) { alert('Your basket is empty.'); return; }
      const pay = ($('input[name="pay"]:checked') || {}).value || 'Cash on delivery';
      const lines = cart.map(c => { const p = findP(c.id); return p ? `${p.name} (${p.ref}) ×${c.qty}` : ''; }).filter(Boolean).join('\n');
      const msg = `New PATO order%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AAddress: ${encodeURIComponent(addr)}%0APayment: ${encodeURIComponent(pay)}%0A%0AItems:%0A${encodeURIComponent(lines)}%0A%0ATotal: ${encodeURIComponent(money(total()))}`;
      window.open('https://wa.me/' + WA + '?text=' + msg, '_blank');
      form.classList.add('hidden');
      $('#order-done').classList.remove('hidden');
      cart = []; saveCart(); updateBadge(); renderBasket();
    });
    const go = $('#go-checkout');
    if (go) go.addEventListener('click', () => { location.hash = '#/checkout'; });
  }

  /* ---------- menu sheet ---------- */
  function openMenu() {
    $('#menu-sheet').classList.add('open');
    $('#menu-backdrop').classList.remove('hidden');
    setTimeout(() => $('#menu-backdrop').classList.add('show'), 10);
    $('#menu-btn').classList.add('open');
    $('#menu-btn').setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    const s = $('#menu-sheet'); if (!s) return;
    s.classList.remove('open');
    const bd = $('#menu-backdrop');
    bd.classList.remove('show');
    setTimeout(() => bd.classList.add('hidden'), 300);
    $('#menu-btn').classList.remove('open');
    $('#menu-btn').setAttribute('aria-expanded', 'false');
  }
  function wireMenu() {
    $('#menu-btn').addEventListener('click', () => {
      $('#menu-sheet').classList.contains('open') ? closeMenu() : openMenu();
    });
    $('#menu-close').addEventListener('click', closeMenu);
    $('#menu-backdrop').addEventListener('click', closeMenu);
    $$('[data-menu-link]').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- contact links ---------- */
  function wireContact() {
    const wa = $('#contact-wa'); if (wa) wa.href = 'https://wa.me/' + WA;
    const fp = $('#footer-wa'); if (fp) fp.href = 'https://wa.me/' + WA;
    const ph = $('#contact-phone'); if (ph) ph.href = 'https://wa.me/' + WA;
  }

  /* ---------- header buttons ---------- */
  function wireHeader() {
    $('#basket-btn').addEventListener('click', () => { location.hash = '#/basket'; });
    $('#site-logo').addEventListener('click', () => { location.hash = '#/'; });
    const back = $('#product-back');
    if (back) back.addEventListener('click', () => { history.length > 1 ? history.back() : (location.hash = '#/category'); });
  }

  /* ---------- scroll reveals ---------- */
  let io = null;
  function refreshReveals() {
    const els = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    if (!io) io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- safety net: never leave the page blank ---------- */
  function safetyNet() {
    setTimeout(() => {
      document.body.classList.add('force-show');
      const sp = $('#splash'); if (sp) sp.classList.add('done');
    }, 2500);
  }

  /* ---------- boot ---------- */
  function boot() {
    try { initSplash(); } catch (e) {}
    try { renderHome(); } catch (e) { console.warn(e); }
    try { wireMenu(); wireHeader(); wireContact(); wireCheckout(); } catch (e) { console.warn(e); }
    try { updateBadge(); } catch (e) {}
    try { route(); } catch (e) { showView('home'); }
    window.addEventListener('hashchange', route);
    refreshReveals();
    safetyNet();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
