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

  /* ---------- splash: full-screen opening page (3 s) ----------
     A hyper-real golden luxury watch is drawn behind the PATO logo —
     metal gradients, gem-set bezel, guilloché dial, sweeping balance
     and a gliding second hand. After exactly 3 seconds it dissolves
     into the start page. */
  const SPLASH_MS = 3000;

  function buildWatchSVG() {
    // ---- gold / steel / dial gradients + soft shadows (the "real" look) ----
    let defs = `
      <radialGradient id="gCase" cx="32%" cy="24%" r="86%">
        <stop offset="0%" stop-color="#f6e7b8"/><stop offset="22%" stop-color="#dcc17f"/>
        <stop offset="45%" stop-color="#B8964E"/><stop offset="68%" stop-color="#7c5c28"/>
        <stop offset="86%" stop-color="#d9bd7c"/><stop offset="100%" stop-color="#5a4118"/>
      </radialGradient>
      <linearGradient id="gBezel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fdf3d2"/><stop offset="26%" stop-color="#c8a45c"/>
        <stop offset="50%" stop-color="#6f5220"/><stop offset="74%" stop-color="#e3c88a"/>
        <stop offset="100%" stop-color="#8a6a2c"/>
      </linearGradient>
      <linearGradient id="gFlange" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2c2a26"/><stop offset="100%" stop-color="#0d0c0a"/>
      </linearGradient>
      <radialGradient id="gDial" cx="42%" cy="34%" r="80%">
        <stop offset="0%" stop-color="#26241f"/><stop offset="55%" stop-color="#151411"/>
        <stop offset="100%" stop-color="#080706"/>
      </radialGradient>
      <linearGradient id="gHand" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f3e2ae"/><stop offset="50%" stop-color="#c9a557"/>
        <stop offset="100%" stop-color="#7d5d24"/>
      </linearGradient>
      <linearGradient id="gCrown" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5a4118"/><stop offset="45%" stop-color="#e6cd93"/>
        <stop offset="100%" stop-color="#6f5220"/>
      </linearGradient>
      <linearGradient id="gLug" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0c484"/><stop offset="100%" stop-color="#6b4f1f"/>
      </linearGradient>` + `
      <radialGradient id="gCab" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#9a3a3c"/><stop offset="60%" stop-color="#5C1A1B"/>
        <stop offset="100%" stop-color="#2a0b0c"/>
      </radialGradient>
      <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity=".16"/>
        <stop offset="42%" stop-color="#ffffff" stop-opacity=".04"/>
        <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <filter id="fSoft" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#000" flood-opacity=".6"/>
      </filter>`;

    // ---- guilloché dial: fine concentric rings + sunburst rays ----
    let guilloche = '';
    for (let r = 12; r <= 74; r += 5) {
      guilloche += `<circle cx="100" cy="100" r="${r}" fill="none" stroke="#B8964E" stroke-width=".35" opacity=".10"/>`;
    }
    for (let i = 0; i < 72; i++) {
      const t = (i * 5 * Math.PI) / 180;
      guilloche += `<line x1="100" y1="100" x2="${(100 + 76 * Math.sin(t)).toFixed(1)}" y2="${(100 - 76 * Math.cos(t)).toFixed(1)}" stroke="#EDE6D6" stroke-width=".2" opacity=".05"/>`;
    }

    // ---- applied markers: double batons at 12, Roman-style dashes elsewhere ----
    let markers = '';
    for (let i = 0; i < 12; i++) {
      const deg = i * 30;
      const long = (i % 3 === 0);
      const w = long ? 3.4 : 1.8;
      markers += `<g transform="rotate(${deg} 100 100)">
        <rect x="${100 - w / 2}" y="${long ? 30 : 34}" width="${w}" height="${long ? 15 : 10}" rx="1" fill="url(#gHand)" filter="url(#fSoft)"/>
        ${long ? `<rect x="${100 - w / 2}" y="${47}" width="${w}" height="4" rx="1" fill="url(#gHand)" opacity=".85"/>` : ''}
      </g>`;
    }
    // minute track
    let track = '';
    for (let i = 0; i < 60; i++) {
      const t = (i * 6 * Math.PI) / 180, big = i % 5 === 0;
      track += `<line x1="${(100 + (big ? 62 : 66) * Math.sin(t)).toFixed(1)}" y1="${(100 - (big ? 62 : 66) * Math.cos(t)).toFixed(1)}" x2="${(100 + 70 * Math.sin(t)).toFixed(1)}" y2="${(100 - 70 * Math.cos(t)).toFixed(1)}" stroke="#E8DCC0" stroke-width="${big ? 1.1 : .5}" opacity="${big ? .75 : .35}"/>`;
    }

    // ---- gem-set bezel (tiny diamonds catching the light) ----
    let gems = '';
    for (let i = 0; i < 36; i++) {
      const t = (i * 10 * Math.PI) / 180;
      gems += `<circle cx="${(100 + 86 * Math.sin(t)).toFixed(1)}" cy="${(100 - 86 * Math.cos(t)).toFixed(1)}" r="1.7" fill="#fff8e6" opacity=".85"/>
               <circle cx="${(100 + 86 * Math.sin(t) - .5).toFixed(1)}" cy="${(100 - 86 * Math.cos(t) - .6).toFixed(1)}" r=".7" fill="#ffffff"/>`;
    }

    // ---- lugs + strap hints so it reads as a real wristwatch ----
    const strap = `
      <path d="M62 26 C58 6 60 -2 74 -2 L126 -2 C140 -2 142 6 138 26 Z" fill="#1b1512" opacity=".9"/>
      <path d="M62 174 C58 194 60 202 74 202 L126 202 C140 202 142 194 138 174 Z" fill="#1b1512" opacity=".9"/>
      <path d="M62 26 C58 6 60 -2 74 -2 L126 -2 C140 -2 142 6 138 26" fill="none" stroke="#3a2c1c" stroke-width="1" stroke-dasharray="3 3"/>
      <path d="M62 174 C58 194 60 202 74 202 L126 202 C140 202 142 194 138 174" fill="none" stroke="#3a2c1c" stroke-width="1" stroke-dasharray="3 3"/>`;

    // ---- sweeping balance wheel visible through an open aperture in the dial ----
    const balance = `
      <g transform="translate(100 128)">
        <circle r="14" fill="#070605" stroke="#7c5c28" stroke-width=".9"/>
        <circle r="14" fill="none" stroke="#f3e2ae" stroke-width=".4" opacity=".5"/>
        <g class="sw-balance">
          <circle r="10.5" fill="none" stroke="url(#gHand)" stroke-width="1.6"/>
          <line x1="-10.5" y1="0" x2="10.5" y2="0" stroke="url(#gHand)" stroke-width="1"/>
          <line x1="0" y1="-10.5" x2="0" y2="10.5" stroke="url(#gHand)" stroke-width="1"/>
          <circle cx="10.5" cy="0" r="1.6" fill="#E8DCC0"/><circle cx="-10.5" cy="0" r="1.6" fill="#E8DCC0"/>
        </g>
        <circle r="1.6" fill="url(#gCab)"/>
      </g>`;

    return `<svg viewBox="0 0 200 200" role="img" aria-label="PATO luxury watch">
      <defs>${defs}</defs>
      ${strap}
      <!-- case -->
      <circle cx="100" cy="100" r="96" fill="url(#gCase)" filter="url(#fSoft)"/>
      <circle cx="100" cy="100" r="92" fill="url(#gBezel)"/>
      ${gems}
      <circle class="sw-bezel-shine" cx="100" cy="100" r="92" fill="none" stroke="#fff6da" stroke-width="1.6" opacity=".2"/>
      <circle cx="100" cy="100" r="80" fill="url(#gFlange)"/>
      <circle cx="100" cy="100" r="76" fill="url(#gDial)"/>
      <g opacity=".9">${guilloche}</g>
      ${track}${markers}
      <!-- crown with ruby cabochon -->
      <g><rect x="194" y="94" width="9" height="12" rx="2.5" fill="url(#gCrown)"/>
         <line x1="196" y1="96.5" x2="201" y2="96.5" stroke="#4a3413" stroke-width=".7"/>
         <line x1="196" y1="99.5" x2="201" y2="99.5" stroke="#4a3413" stroke-width=".7"/>
         <line x1="196" y1="102.5" x2="201" y2="102.5" stroke="#4a3413" stroke-width=".7"/>
         <circle cx="203" cy="100" r="3.4" fill="url(#gCab)"/></g>
      <!-- maison signature on the dial -->
      <text x="100" y="72" text-anchor="middle" font-family="Georgia,serif" font-size="9" letter-spacing="2.4" fill="#E8DCC0" opacity=".9">PATO</text>
      <text x="100" y="160" text-anchor="middle" font-family="Georgia,serif" font-size="4.4" letter-spacing="1.6" fill="#B8964E" opacity=".75">GENÈVE · AUTOMATIC</text>
      ${balance}
      <!-- hands (set to the real time, second hand glides) -->
      <g class="sw-hour"><path d="M100 106 L97.4 66 Q100 60 102.6 66 L100 106 Z" fill="url(#gHand)" filter="url(#fSoft)"/></g>
      <g class="sw-min"><path d="M100 106 L98 48 Q100 43 102 48 L100 106 Z" fill="url(#gHand)" filter="url(#fSoft)"/></g>
      <g class="sw-sec"><line x1="100" y1="114" x2="100" y2="42" stroke="#5C1A1B" stroke-width="1.3" stroke-linecap="round"/>
        <circle cx="100" cy="42" r="1.8" fill="#5C1A1B"/></g>
      <circle cx="100" cy="100" r="3.6" fill="url(#gCase)" stroke="#3a2a10" stroke-width=".6"/>
      <circle cx="100" cy="100" r="1.3" fill="#1a1408"/>
      <!-- domed sapphire crystal reflection -->
      <ellipse cx="100" cy="100" rx="78" ry="78" fill="url(#gGlass)"/>
      <path d="M44 60 A 72 72 0 0 1 132 34 L 120 52 A 56 56 0 0 0 56 74 Z" fill="#ffffff" opacity=".07"/>
    </svg>`;
  }

  function initSplash() {
    const splash = $('#splash');
    if (!splash) return;

    // draw the watch behind the logo
    const stage = $('#sw-stage');
    if (stage) stage.innerHTML = buildWatchSVG();

    // thin gold line that fills over the 3 seconds
    const timer = document.createElement('div');
    timer.className = 'splash-timer';
    timer.innerHTML = '<i></i>';
    splash.appendChild(timer);

    // hands show the current time; second hand glides smoothly
    const hour = $('.sw-hour'), min = $('.sw-min'), sec = $('.sw-sec'), bal = $('.sw-balance');
    const now = new Date();
    if (hour) hour.setAttribute('transform', `rotate(${(now.getHours() % 12) * 30 + now.getMinutes() * 0.5} 100 100)`);
    if (min) min.setAttribute('transform', `rotate(${now.getMinutes() * 6} 100 100)`);
    let rafId = 0, running = true;
    (function tick() {
      if (!running || !sec) return;
      const d = new Date();
      const deg = d.getSeconds() * 6 + d.getMilliseconds() * 0.006;
      sec.setAttribute('transform', `rotate(${deg} 100 100)`);
      rafId = requestAnimationFrame(tick);
    })();
    // balance wheel oscillates (CSS keeps it alive even without JS)
    if (bal && bal.animate) {
      bal.animate([{ transform: 'rotate(-58deg)' }, { transform: 'rotate(58deg)' }, { transform: 'rotate(-58deg)' }],
        { duration: 800, iterations: Infinity, easing: 'ease-in-out' });
      bal.style.transformOrigin = '0px 0px';
    }

    // hold the opening page for exactly 3 s, then dissolve into the start page
    let finished = false;
    const hide = () => {
      if (finished) return;
      finished = true; running = false; cancelAnimationFrame(rafId);
      splash.classList.add('done');
      setTimeout(() => splash.remove(), 1300);
    };
    setTimeout(hide, SPLASH_MS);
    window.addEventListener('click', hide, { once: true }); // tap to enter immediately
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
