/* ============================================================
   PATO — script.js
   GSAP + ScrollTrigger, Lenis smooth scroll, Three.js hero watch,
   hash router, cart (localStorage), wishlist, search, checkout.
   Everything degrades gracefully if a library fails to load.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  const hasTHREE = typeof window.THREE !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
     ANTI-BLACK-SCREEN GUARANTEES (run first, before anything else)
     No matter what crashes later, the page must never stay dark:
     - loader/wipe overlays are force-removed within 3s
     - any .reveal stuck invisible becomes visible
     ============================================================ */
  function forceVisible() {
    try {
      document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
      document.querySelectorAll('.hero-title .w i').forEach(i => { i.style.transform = 'none'; });
      const l = document.getElementById('loader'); if (l) l.remove();
      const w = document.getElementById('wipe');   if (w) w.style.display = 'none';
      if (!document.querySelector('.view.active')) {
        const vh = document.getElementById('view-home'); if (vh) vh.classList.add('active');
      }
    } catch (_) {}
  }
  setTimeout(forceVisible, 3000);
  setInterval(() => {
    try {
      const vh = innerHeight;
      document.querySelectorAll('.reveal:not(.in)').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) el.classList.add('in');
      });
    } catch (_) {}
  }, 700);

  /* ---------------- state (Context-style store) ---------------- */
  const store = {
    cart: JSON.parse(localStorage.getItem('pato_cart') || '[]'),
    wish: JSON.parse(localStorage.getItem('pato_wish') || '[]'),
    currency: localStorage.getItem('pato_cur') || 'EGP',
    subscribe(fn) { this._fn = fn; },
    save() {
      localStorage.setItem('pato_cart', JSON.stringify(this.cart));
      localStorage.setItem('pato_wish', JSON.stringify(this.wish));
      localStorage.setItem('pato_cur', this.currency);
      if (this._fn) this._fn();
    },
    add(id) {
      const it = this.cart.find(c => c.id === id);
      if (it) it.qty++; else this.cart.push({ id, qty: 1 });
      this.save();
    }
  };
  const findP = id => window.PATO_PRODUCTS.find(p => p.id === id);
  const fmt = p => {
    if (store.currency === 'USD') return '$ ' + Math.round(p / 50).toLocaleString();
    return 'EGP ' + p.toLocaleString('en-US');
  };

  /* ---------------- lenis smooth scroll (hardened) ---------------- */
  let lenis = null;
  if (window.Lenis && !REDUCED) {
    try {
      lenis = new window.Lenis({ duration: 1.4, smoothWheel: true });
      if (hasST) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      }
    } catch (err) {
      console.warn('Lenis disabled (init error):', err);
      try { document.documentElement.classList.remove('lenis'); } catch (_) {}
      lenis = null;
    }
  }
  const scrollToTop = () => lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
  const scrollToY = y => lenis ? lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: 'smooth' });

  /* ---------------- custom cursor + magnetic buttons ---------------- */
  const dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
  if (dot && matchMedia('(pointer:fine)').matches && !REDUCED) {
    let mx = innerWidth / 2, my = innerHeight / 2;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    const r = { x: mx, y: my };
    (function loop() {
      r.x += (mx - r.x) * .14; r.y += (my - r.y) * .14;
      ring.style.left = r.x + 'px'; ring.style.top = r.y + 'px';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      const card = e.target.closest('.card, .tri-card, .hg-card');
      const btn = e.target.closest('button, a, input, select');
      ring.classList.toggle('hover', !!card || !!btn);
      label.textContent = card ? 'VIEW' : (e.target.closest('#explode-svg,.viewer-stage') ? 'DRAG' : '');
    });
    // magnetic attraction on .btn-magnet
    $$('.btn-magnet').forEach(bindMagnet);
    function bindMagnet(el) {
      el.addEventListener('mousemove', e => {
        const b = el.getBoundingClientRect();
        const x = (e.clientX - b.left - b.width / 2) * .3;
        const y = (e.clientY - b.top - b.height / 2) * .3;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    }
    window.__bindMagnet = bindMagnet;
  } else {
    window.__bindMagnet = () => {};
  }

  /* ---------------- live clock ornament ---------------- */
  const coS = $('.co-sec'), coM = $('.co-min'), coH = $('.co-hour'), coBox = $('#clock-ornament');
  function tickClock() {
    const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
    if (coS) coS.setAttribute('transform', `rotate(${s * 6} 30 30)`);
    if (coM) coM.setAttribute('transform', `rotate(${m * 6} 30 30)`);
    if (coH) coH.setAttribute('transform', `rotate(${h * 30} 30 30)`);
  }
  if (coS) { tickClock(); setInterval(tickClock, 1000); }
  function pulseClock() { if (!coBox) return; coBox.classList.add('pulse'); setTimeout(() => coBox.classList.remove('pulse'), 450); }

  /* ---------------- intro loader ---------------- */
  let loaderDone = false;
  function killLoader() {
    if (loaderDone) return;
    loaderDone = true;
    const l = $('#loader');
    if (l) l.remove();
  }
  function runLoader(done) {
    const loader = $('#loader');
    if (!loader) return done();
    if (REDUCED || !hasGSAP) { loader.remove(); loaderDone = true; return done(); }
    // Only reveal the black overlay now that we know GSAP can animate it away.
    loader.classList.add('show');
    // SAFETY: never leave the screen black — force-remove the overlay after 2.5s
    setTimeout(killLoader, 2500);
    const g = $('.markers');
    for (let i = 0; i < 12; i++) {
      const t = i * 30 * Math.PI / 180;
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', 100 + 72 * Math.sin(t)); ln.setAttribute('y1', 100 - 72 * Math.cos(t));
      ln.setAttribute('x2', 100 + 78 * Math.sin(t)); ln.setAttribute('y2', 100 - 78 * Math.cos(t));
      g.appendChild(ln);
    }
    const now = new Date();
    const hourA = ((now.getHours() % 12) + now.getMinutes() / 60) * 30;
    const minA = now.getMinutes() * 6;
    const tl = gsap.timeline({ onComplete: () => { killLoader(); done(); } });
    try {
    tl.to('.bezel-line', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
      .to('.markers line', { opacity: 1, duration: .05, stagger: .055 }, '-=.3')
      .to('.bezel-pin', { opacity: 1, duration: .2 }, '<')
      .set(['.hand-hour', '.hand-min'], { opacity: 1 }, '<')
      .fromTo('.hand-min', { rotation: 0 }, { rotation: minA, duration: .9, ease: 'back.out(1.4)' }, '-=.1')
      .fromTo('.hand-hour', { rotation: 0 }, { rotation: hourA, duration: .9, ease: 'back.out(1.2)' }, '<.1')
      .to('.loader-word', { opacity: 1, duration: .5 }, '<')
      .to(loader, { clipPath: 'circle(150% at 50% 50%)', duration: .1, onStart() {
          gsap.to('.bezel', { scale: 9, opacity: 0, duration: 1.1, ease: 'power3.in', transformOrigin: '50% 50%' });
          gsap.to('.loader-word', { opacity: 0, duration: .4 });
        } }, '+=.5')
      .to(loader, { autoAlpha: 0, duration: .4 }, '<0.7');
    } catch (err) {
      console.error('PATO loader error:', err);
      killLoader(); done();
    }
    // circle-expand trick: animate svg scale then fade overlay
  }

  /* ---------------- page wipe transition ---------------- */
  function wipe(cb) {
    const w = $('#wipe');
    if (!w || REDUCED || !hasGSAP) return cb();
    let called = false;
    const run = () => { if (!called) { called = true; cb(); } };
    // Hard safety: the wipe overlay must NEVER stay visible longer than 1.4s
    setTimeout(() => { try { gsap.set(w, { display: 'none', clipPath: 'circle(0% at 50% 50%)' }); } catch (_) {} run(); }, 1400);
    const line = $('#wipe line');
    const tl = gsap.timeline();
    tl.set(w, { display: 'flex', clipPath: 'circle(0% at 50% 50%)' })
      .to(w, { clipPath: 'circle(120% at 50% 50%)', duration: .6, ease: 'power3.in' })
      .fromTo(line, { rotation: 0 }, { rotation: 180, duration: 1.2, ease: 'power2.inOut', transformOrigin: '50px 50px' }, 0)
      .add(() => { run(); })
      .to(w, { clipPath: 'circle(0% at 50% 50%)', duration: .7, ease: 'power3.out', delay: .15 })
      .set(w, { display: 'none' });
  }

  /* ---------------- router ---------------- */
  const VIEWS = ['home', 'collections', 'shop', 'product', 'about', 'journal', 'contact', 'cart', 'checkout'];
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    return { view: parts[0] || 'home', arg: parts[1], query: Object.fromEntries(new URLSearchParams(query || '')) };
  }
  function show(view) {
    VIEWS.forEach(v => { const el = $('#view-' + v); if (el) el.classList.toggle('active', v === view); });
  }
  function route(first) {
    const r = parseHash();
    const go = () => {
      switch (r.view) {
        case 'collections': renderCollections(r.query.c); break;
        case 'shop': renderShop(); break;
        case 'product': renderProduct(r.arg); break;
        case 'journal': renderJournal(); break;
        case 'cart': renderCartPage(); break;
        case 'checkout': renderCheckout(); break;
        default: show('home');
      }
      if (r.view !== 'home') show(r.view);
      refreshReveals();
      if (!first) scrollToTop();
      if (hasST) ScrollTrigger.refresh();
    };
    first ? go() : wipe(go);
  }
  addEventListener('hashchange', () => route(false));

  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav],[data-menu]');
    if (nav && nav.getAttribute('href') && nav.getAttribute('href').startsWith('#')) {
      closeMenu(); closeSearch();
      const cur = location.hash || '#/';
      if (cur === nav.getAttribute('href')) { e.preventDefault(); scrollToTop(); }
      // otherwise browser fires hashchange → route with wipe
    }
  });

  /* ---------------- product card template ---------------- */
  function cardHTML(p) {
    return `<article class="card reveal" data-id="${p.id}">
      ${p.soldOut ? '<span class="soldout-tag">Sold out</span>' : ''}
      <a href="#/product/${p.id}" data-nav class="card-imgwrap"><img src="${p.images[0]}" alt="${p.name}" loading="lazy"></a>
      <div class="card-actions">
        <div><h3><a href="#/product/${p.id}" data-nav>${p.name}</a></h3>
        <span class="ref">${p.ref} · ${p.size} mm</span>
        <div class="price">${fmt(p.priceEGP)}</div></div>
        <div style="display:flex;gap:12px;align-items:center">
          <button class="wish-btn ${store.wish.includes(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Wishlist">♥</button>
          ${p.soldOut ? '' : `<button class="add-mini" data-add="${p.id}">Add</button>`}
        </div>
      </div>
    </article>`;
  }

  /* ---------------- shop ---------------- */
  function filtered() {
    const v = id => $('#' + id) ? $('#' + id).value : '';
    let list = window.PATO_PRODUCTS.slice();
    const col = v('f-collection'), str = v('f-strap'), mat = v('f-material'), sz = v('f-size'), pr = v('f-price'), so = v('f-sort');
    if (col) list = list.filter(p => p.collection === col);
    if (str) list = list.filter(p => p.strap === str);
    if (mat) list = list.filter(p => p.material === mat);
    if (sz) list = list.filter(p => String(p.size) === sz);
    if (pr === 'lo') list = list.filter(p => p.priceEGP < 60000);
    if (pr === 'mid') list = list.filter(p => p.priceEGP >= 60000 && p.priceEGP <= 100000);
    if (pr === 'hi') list = list.filter(p => p.priceEGP > 100000);
    if (so === 'asc') list.sort((a, b) => a.priceEGP - b.priceEGP);
    if (so === 'desc') list.sort((a, b) => b.priceEGP - a.priceEGP);
    return list;
  }
  function renderShop() {
    show('shop');
    const grid = $('#shop-grid');
    grid.innerHTML = filtered().map(cardHTML).join('');
    if (hasGSAP && !REDUCED) {
      gsap.from('#shop-grid .card', { y: 60, opacity: 0, duration: .9, stagger: .07, ease: 'power3.out', overwrite: true });
    }
  }
  $$('#filters select').forEach(s => s.addEventListener('change', renderShop));
  const fClear = $('#f-clear'); if (fClear) fClear.addEventListener('click', () => { $$('#filters select').forEach(s => s.value = ''); renderShop(); });

  /* ---------------- collections ---------------- */
  function renderCollections(sel) {
    show('collections');
    const body = $('#collections-body');
    const cols = ['Obsidian', 'Ember', 'Lunar'];
    body.innerHTML = (sel ? cols.filter(c => c.toLowerCase() === sel.toLowerCase()) : cols).map(c => {
      const roman = { Obsidian: 'I', Ember: 'II', Lunar: 'III' }[c];
      return `<section class="coll-block" id="coll-${c.toLowerCase()}">
        <header><span class="roman big">${roman}</span><h2>${c}</h2></header>
        <div class="grid">${window.PATO_PRODUCTS.filter(p => p.collection === c).map(cardHTML).join('')}</div>
      </section>`;
    }).join('');
  }

  /* ---------------- product detail ---------------- */
  function renderProduct(id) {
    const p = findP(id);
    if (!p) { location.hash = '#/shop'; return; }
    show('product');
    const related = window.PATO_PRODUCTS.filter(x => x.collection === p.collection && x.id !== p.id).slice(0, 4);
    $('#product-body').innerHTML = `
      <div class="prod">
        <div class="prod-viewer">
          <div class="viewer-stage" id="viewer">
            ${p.images.map((src, i) => `<img src="${src}" class="${i === 0 ? 'on' : ''}" data-i="${i}" alt="${p.name} photo ${i + 1}">`).join('')}
            <span class="viewer-hint mono">drag to rotate</span>
          </div>
          <div class="thumbs">${p.images.map((src, i) => `<img src="${src}" data-t="${i}" class="${i === 0 ? 'on' : ''}" alt="thumbnail ${i + 1}">`).join('')}</div>
        </div>
        <div class="prod-info">
          <span class="ref mono">${p.ref} · ${p.collection}</span>
          <h1>${p.name}</h1>
          <p class="poem">${p.poem}</p>
          <div class="price-big">${fmt(p.priceEGP)}</div>
          <span class="mono">Dial / strap tone</span>
          <div class="swatches">${p.colors.map((c, i) => `<button class="swatch ${i === 0 ? 'on' : ''}" style="background:${c}" data-sw="${i}" aria-label="color ${i + 1}"></button>`).join('')}</div>
          <div class="wrist-guide">
            <span class="mono">Wrist size guide</span>
            <div class="wrist-bar"><i class="wrist-marker" id="wrist-mark"></i></div>
            <p class="mono faint" id="wrist-txt" style="margin-top:10px">${p.size} mm case — ideal for 16–19 cm wrists</p>
          </div>
          ${p.soldOut ? `
            <form class="notify-form" id="notify">
              <input type="email" required placeholder="Email me when it returns" aria-label="Notify email">
              <button type="submit" class="btn-magnet">Notify me</button>
            </form>` : `
            <div class="buy-row">
              <button class="btn-magnet" data-add="${p.id}">Add to selection</button>
              <button class="buy-icon" data-add="${p.id}" aria-label="Buy now">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 8h12l-1.2 12H7.2L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
              </button>
            </div>`}
          <div class="accordion">
            <div class="acc-item"><button type="button">Specifications <span>+</span></button>
              <div class="acc-body"><table>${p.specs.map(s => `<tr><td>${s[0]}</td><td>${s[1]}</td></tr>`).join('')}</table></div></div>
            <div class="acc-item"><button type="button">Delivery &amp; engraving <span>+</span></button>
              <div class="acc-body"><table><tr><td>Shipping</td><td>Complimentary insured courier, 3–5 days</td></tr><tr><td>Engraving</td><td>Free hand engraving on caseback</td></tr><tr><td>Warranty</td><td>5 years atelier warranty</td></tr></table></div></div>
          </div>
        </div>
      </div>
      <section class="related"><h2>From the same series</h2>
        <div class="rel-track">${related.map(r => `<div class="hg-card">${cardHTML(r)}</div>`).join('')}</div>
      </section>`;

    // viewer drag-to-rotate (crossfade images)
    const stage = $('#viewer');
    let idx = 0, dragging = false, sx = 0;
    const imgs = $$('#viewer .viewer-stage img');
    function setImg(i) {
      idx = (i + p.images.length) % p.images.length;
      imgs.forEach((im, k) => im.classList.toggle('on', k === idx));
      $$('#viewer .thumbs img').forEach((t, k) => t.classList.toggle('on', k === idx));
    }
    stage.addEventListener('pointerdown', e => { dragging = true; sx = e.clientX; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointerup', e => {
      if (!dragging) return; dragging = false;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 24) setImg(idx + (dx > 0 ? -1 : 1));
    });
    stage.addEventListener('click', e => { if (Math.abs(e.clientX - sx) < 6) setImg(idx + 1); });
    $$('#viewer .thumbs img').forEach(t => t.addEventListener('click', () => setImg(+t.dataset.t)));
    $$('#viewer .swatch').forEach(sw => sw.addEventListener('click', () => {
      $$('#viewer .swatch').forEach(x => x.classList.remove('on')); sw.classList.add('on');
      setImg(idx + 1);
      const mark = $('#wrist-mark'); if (mark) mark.style.left = (20 + (+sw.dataset.sw) * 30) + '%';
    }));
    // accordions
    $$('#product-body .acc-item > button').forEach(b => b.addEventListener('click', () => {
      const body = b.nextElementSibling, open = body.style.maxHeight;
      $$('#product-body .acc-body').forEach(x => { x.style.maxHeight = null; });
      $$('#product-body .acc-item > button span').forEach(x => x.textContent = '+');
      if (!open) { body.style.maxHeight = body.scrollHeight + 'px'; b.querySelector('span').textContent = '−'; }
    }));
    const nf = $('#notify'); if (nf) nf.addEventListener('submit', e => { e.preventDefault(); nf.innerHTML = '<p class="mono" style="color:var(--gold)">We will whisper when it returns.</p>'; });
    $$('#product-body .btn-magnet').forEach(window.__bindMagnet);
    if (hasGSAP && !REDUCED) gsap.from('.prod-info > *', { y: 40, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', clearProps: 'all' });
  }

  /* ---------------- journal ---------------- */
  function renderJournal() {
    show('journal');
    $('#journal-body').innerHTML = window.PATO_JOURNAL.map(j => `
      <article class="j-card reveal"><img src="${j.img}" alt="${j.title}" loading="lazy">
      <h3><span class="roman big" style="display:inline;margin-right:10px">${j.num}</span>${j.title}</h3><p>${j.blurb}</p></article>`).join('');
  }

  /* ---------------- cart drawer + pages ---------------- */
  const drawer = $('#cart-drawer'), scrim = $('#scrim');
  function openDrawer() { drawer.classList.add('open'); scrim.classList.add('show'); }
  function closeDrawer() { drawer.classList.remove('open'); scrim.classList.remove('show'); }
  function renderCartItems() {
    const box = $('#cart-items');
    if (!store.cart.length) { box.innerHTML = '<p class="cd-empty">Nothing chosen yet. Time waits for you.</p>'; }
    else box.innerHTML = store.cart.map(c => {
      const p = findP(c.id);
      return `<div class="ci"><img src="${p.images[0]}" alt=""><div class="ci-name"><b>${p.name}</b><span class="ref mono">${fmt(p.priceEGP)}</span></div>
        <div class="qty"><button data-q="-1" data-id="${p.id}">−</button><span>${c.qty}</span><button data-q="1" data-id="${p.id}">+</button></div></div>`;
    }).join('');
    const gift = $('#opt-gift').checked ? 250 : 0;
    $('#cart-total').textContent = fmt(store.cart.reduce((s, c) => s + findP(c.id).priceEGP * c.qty, 0) + gift);
    const badge = $('#cart-count');
    badge.classList.toggle('hidden', !store.cart.length);
    badge.textContent = '';
  }
  document.addEventListener('click', e => {
    const q = e.target.closest('[data-q]');
    if (q) {
      const it = store.cart.find(c => c.id === q.dataset.id);
      if (it) { it.qty += +q.dataset.q; if (it.qty <= 0) store.cart = store.cart.filter(c => c.id !== it.id); store.save(); }
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      store.add(add.dataset.add); pulseClock();
      flyToCart(add);
      openDrawer();
      return;
    }
    const w = e.target.closest('[data-wish]');
    if (w) {
      const id = w.dataset.wish;
      store.wish = store.wish.includes(id) ? store.wish.filter(x => x !== id) : [...store.wish, id];
      store.save(); w.classList.toggle('on', store.wish.includes(id));
      if (hasGSAP) gsap.fromTo(w, { scale: .6 }, { scale: 1, duration: .5, ease: 'elastic.out(1,.4)', clearProps: 'scale' });
    }
  });
  store.subscribe(renderCartItems);

  function flyToCart(srcEl) {
    const p = findP(srcEl.dataset.add);
    const fly = $('#fly-item'), target = $('#cart-open');
    if (!p || !fly || !target || REDUCED || !hasGSAP) return;
    const a = (srcEl.closest('.card') || srcEl).getBoundingClientRect();
    const b = target.getBoundingClientRect();
    fly.innerHTML = `<img src="${p.images[0]}" alt="">`;
    gsap.set(fly, { x: a.left + a.width / 2 - 30, y: a.top, opacity: 1, scale: 1, rotation: 0 });
    gsap.to(fly, { x: b.left + b.width / 2 - 30, y: b.top + 118, scale: .25, rotation: 20, opacity: .9, duration: 1, ease: 'power3.in',
      onComplete: () => { gsap.to(fly, { opacity: 0, duration: .2 }); gsap.fromTo(target, { scale: 1.3 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' }); } });
  }

  $('#cart-open').addEventListener('click', () => { renderCartItems(); openDrawer(); });
  $('#cart-close').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', () => { closeDrawer(); closeMenu(); });
  $('#opt-gift').addEventListener('change', renderCartItems);
  $('#opt-engraving').addEventListener('change', renderCartItems);
  $('#cart-checkout').addEventListener('click', () => { closeDrawer(); location.hash = '#/checkout'; });

  function renderCartPage() {
    show('cart');
    renderCartItems();
    $('#cart-page-body').innerHTML = `
      <div class="checkout-wrap">${$('#cart-items').innerHTML}
      <div class="cd-total"><span class="mono">Subtotal</span><b>${$('#cart-total').textContent}</b></div>
      <div class="co-nav"><a href="#/shop" data-nav class="btn-magnet">Keep browsing</a>
      <button class="btn-magnet" id="cp-checkout">Checkout</button></div></div>`;
    const c = $('#cp-checkout'); if (c) { c.addEventListener('click', () => location.hash = '#/checkout'); window.__bindMagnet(c); }
  }

  /* ---------------- checkout (multi-step dial) ---------------- */
  function renderCheckout() {
    show('checkout');
    if (!store.cart.length) { $('#checkout-body').innerHTML = '<p class="cd-empty" style="text-align:center;padding:10vh">Your selection is empty.</p>'; return; }
    let step = 0;
    const total = store.cart.reduce((s, c) => s + findP(c.id).priceEGP * c.qty, 0);
    $('#checkout-body').innerHTML = `
      <div class="checkout-wrap">
        <div class="dial-progress"><svg width="80" height="80" viewBox="0 0 80 80">
          <circle class="track" cx="40" cy="40" r="35"/>
          <circle class="fillarc" id="arc" cx="40" cy="40" r="35"/>
        </svg></div>
        <div class="step-labels"><span class="on">Details</span><span>Shipping</span><span>Payment</span></div>
        <form id="co-form">
          <div class="co-step" data-s="0">
            <div class="field"><label>Full name</label><input name="name" required data-v=".{2,}"><p class="err">Please write your name</p></div>
            <div class="field"><label>Email</label><input name="email" type="email" required data-v=".*@.*\\..+"><p class="err">Invalid email</p></div>
            <div class="field"><label>Phone</label><input name="phone" required data-v="[0-9]{8,}"><p class="err">Invalid phone</p></div>
          </div>
          <div class="co-step hidden" data-s="1">
            <div class="field"><label>Address</label><input name="addr" required data-v=".{5,}"><p class="err">Too short</p></div>
            <div class="field"><label>City</label><input name="city" required data-v=".{2,}"><p class="err">Required</p></div>
          </div>
          <div class="co-step hidden" data-s="2">
            <div class="field"><label>Card number</label><input name="card" required inputmode="numeric" data-v="[0-9 ]{12,}"><p class="err">Invalid card</p></div>
            <div class="field"><label>Expiry / CVV</label><input name="exp" required data-v=".{4,}"><p class="err">Required</p></div>
            <div class="cd-total"><span class="mono">Total due</span><b>${fmt(total)}</b></div>
          </div>
          <div class="co-nav">
            <button type="button" class="btn-magnet" id="co-back">Back</button>
            <button type="submit" class="btn-magnet" id="co-next">Continue</button>
          </div>
        </form>
      </div>`;
    const arc = $('#arc'), labels = $$('.step-labels span');
    function paint() {
      arc.style.strokeDashoffset = 220 - (220 * (step + 1) / 3);
      labels.forEach((l, i) => l.classList.toggle('on', i === step));
      $$('.co-step').forEach(s => s.classList.toggle('hidden', +s.dataset.s !== step));
      $('#co-back').style.visibility = step ? 'visible' : 'hidden';
      $('#co-next').textContent = step === 2 ? 'Place order' : 'Continue';
    }
    paint();
    $('#co-back').addEventListener('click', () => { if (step) { step--; paint(); } });
    $('#co-form').addEventListener('submit', e => {
      e.preventDefault();
      const fields = $$(`.co-step[data-s="${step}"] [data-v]`);
      let ok = true;
      fields.forEach(f => {
        const good = new RegExp('^' + f.dataset.v + '$').test(f.value.trim());
        f.closest('.field').classList.toggle('invalid', !good);
        if (!good) ok = false;
      });
      if (!ok) return;
      if (step < 2) { step++; paint(); return; }
      // success
      store.cart = []; store.save();
      $('.checkout-wrap').innerHTML = `
        <div class="success-anim">
          <svg class="hands" viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="none" stroke="var(--gold)" stroke-width="1"/>
          <line x1="30" y1="30" x2="30" y2="12"/><line x1="30" y1="30" x2="44" y2="30" style="animation-delay:.2s"/></svg>
          <h2>Your time is on its way.</h2>
          <p class="mono" style="margin-top:14px">Confirmation whispers to your inbox</p>
          <a href="#/" data-nav class="btn-magnet" style="margin-top:34px;display:inline-block">Return home</a>
        </div>`;
      if (hasGSAP && !REDUCED) gsap.from('.success-anim > *', { y: 50, opacity: 0, stagger: .18, duration: 1, ease: 'power3.out' });
    });
    $$('#checkout-body .btn-magnet').forEach(window.__bindMagnet);
  }

  /* ---------------- menu / search overlays ---------------- */
  const menu = $('#menu-sheet'), burger = $('#menu-open');
  function openMenu() { menu.classList.add('open'); burger.classList.add('open'); }
  function closeMenu() { menu.classList.remove('open'); burger.classList.remove('open'); }
  burger.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
  $('#menu-close').addEventListener('click', closeMenu);
  $$('[data-menu]').forEach(a => a.addEventListener('click', closeMenu));

  const search = $('#search-overlay');
  $('#search-open').addEventListener('click', () => { search.classList.add('open'); setTimeout(() => $('#search-input').focus(), 300); });
  $('#search-close').addEventListener('click', closeSearch);
  function closeSearch() { search.classList.remove('open'); }
  $('#search-input').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const res = q ? window.PATO_PRODUCTS.filter(p => (p.name + p.ref + p.collection).toLowerCase().includes(q)).slice(0, 6) : [];
    $('#search-results').innerHTML = res.map(p => `<li><a href="#/product/${p.id}" data-nav><span>${p.name}</span><span class="mono">${p.ref}</span></a></li>`).join('');
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenu(); closeSearch(); closeDrawer(); }
  });

  /* ---------------- wishlist opener ---------------- */
  $('#wish-open').addEventListener('click', () => {
    if (!store.wish.length) { alert('The wishlist is quiet for now. Tap ♥ on a piece.'); return; }
    location.hash = '#/shop';
    setTimeout(() => {
      $('#shop-grid').innerHTML = store.wish.map(id => cardHTML(findP(id))).join('');
    }, 650);
  });

  /* ---------------- currency toggle ---------------- */
  $('#currency-toggle').addEventListener('click', function () {
    store.currency = store.currency === 'EGP' ? 'USD' : 'EGP';
    this.textContent = store.currency;
    store.save();
    const r = parseHash();
    if (r.view === 'shop') renderShop(); else if (r.view === 'collections') renderCollections(r.query.c);
    renderCartItems();
  });

  /* ---------------- sound toggle (WebAudio tick) ---------------- */
  let audioCtx = null, tickTimer = null;
  $('#sound-toggle').addEventListener('click', function () {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; this.classList.remove('on'); return; }
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const tick = () => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 2100; o.type = 'square';
      g.gain.setValueAtTime(.015, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .03);
      o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + .035);
    };
    tick(); tickTimer = setInterval(tick, 1000); this.classList.add('on');
  });

  /* ---------------- home gallery + drag scroll (optional) ---------------- */
  (function buildHomeGallery() {
    const track = $('#home-gallery');
    if (!track) return;
    const picks = window.PATO_PRODUCTS.filter(p => !p.soldOut).slice(0, 6);
    track.innerHTML = picks.map(cardHTML).join('');
    let down = false, startX = 0, startL = 0;
    track.addEventListener('pointerdown', e => { down = true; startX = e.clientX; startL = track.scrollLeft; track.classList.add('dragging'); });
    track.addEventListener('pointermove', e => { if (down) track.scrollLeft = startL - (e.clientX - startX); });
    addEventListener('pointerup', () => { down = false; track.classList.remove('dragging'); });
  })();

  /* ---------------- particles in light beam ---------------- */
  (function particles() {
    const box = $('.particles');
    if (!box || REDUCED) return;
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('span');
      s.className = 'particle';
      const size = 1 + Math.random() * 3;
      s.style.cssText = `width:${size}px;height:${size}px;left:${30 + Math.random() * 40}%;top:${40 + Math.random() * 55}%;animation-duration:${8 + Math.random() * 10}s;animation-delay:${Math.random() * 12}s`;
      box.appendChild(s);
    }
  })();

  /* ---------------- three.js hero watch ---------------- */
  (function heroWatch() {
    const canvas = $('#hero-canvas');
    if (!canvas || !hasTHREE || REDUCED) { if (canvas) canvas.style.display = 'none'; return; }
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
      camera.position.set(0, 0, 7);
      const gold = new THREE.MeshStandardMaterial({ color: 0xB8964E, metalness: .9, roughness: .25 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x0A0A0B, metalness: .4, roughness: .6 });
      const ivory = new THREE.MeshStandardMaterial({ color: 0xEDE6D6, metalness: .2, roughness: .4 });
      const watch = new THREE.Group();
      const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.7, .16, 24, 90), gold); watch.add(bezel);
      const dial = new THREE.Mesh(new THREE.CircleGeometry(1.62, 64), dark); dial.position.z = .05; watch.add(dial);
      const crystal = new THREE.Mesh(new THREE.SphereGeometry(1.75, 48, 24, 0, Math.PI * 2, 0, Math.PI / 3.4),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .07, roughness: 0, metalness: 0 }));
      crystal.rotation.x = Math.PI; crystal.position.z = .1; watch.add(crystal);
      for (let i = 0; i < 12; i++) {
        const t = i * Math.PI / 6;
        const mk = new THREE.Mesh(new THREE.BoxGeometry(.05, .18, .03), i % 3 ? ivory : gold);
        mk.position.set(Math.sin(t) * 1.35, Math.cos(t) * 1.35, .1); mk.rotation.z = -t; watch.add(mk);
      }
      const hourH = new THREE.Mesh(new THREE.BoxGeometry(.07, .9, .03), gold); hourH.position.y = .45; hourH.position.z = .14;
      const hourG = new THREE.Group(); hourG.add(hourH); watch.add(hourG);
      const minH = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.25, .03), ivory); minH.position.y = .62; minH.position.z = .16;
      const minG = new THREE.Group(); minG.add(minH); watch.add(minG);
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .1, 20), gold); pin.rotation.x = Math.PI / 2; pin.position.z = .18; watch.add(pin);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .22, 12), gold); crown.rotation.z = Math.PI / 2; crown.position.x = 1.95; watch.add(crown);
      watch.rotation.x = .25;
      scene.add(watch);
      scene.add(new THREE.AmbientLight(0xE8DCC0, .5));
      const key = new THREE.PointLight(0xB8964E, 60, 30); key.position.set(4, 4, 6); scene.add(key);
      const rim = new THREE.PointLight(0x5C1A1B, 30, 30); rim.position.set(-5, -3, 4); scene.add(rim);

      let tx = 0, ty = 0;
      addEventListener('mousemove', e => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); });
      function resize() {
        const r = canvas.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
      }
      addEventListener('resize', resize); resize();
      (function loop(t) {
        requestAnimationFrame(loop);
        const s = new Date().getSeconds() + new Date().getMilliseconds() / 1000;
        const m = new Date().getMinutes() + s / 60;
        const h = (new Date().getHours() % 12) + m / 60;
        minG.rotation.z = -m * Math.PI / 30;
        hourG.rotation.z = -h * Math.PI / 6;
        watch.rotation.y += (tx * .7 - watch.rotation.y) * .04;
        watch.rotation.x += (.25 + ty * .5 - watch.rotation.x) * .04;
        watch.rotation.z = Math.sin(t / 4000) * .04; // slow idle spin feel
        renderer.render(scene, camera);
      })(0);
    } catch (err) { canvas.style.display = 'none'; }
  })();

  /* ---------------- scroll storytelling ---------------- */
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .15 }) : null;
  function refreshReveals() {
    if (io) $$('.reveal:not(.in)').forEach(el => io.observe(el));
    else $$('.reveal').forEach(el => el.classList.add('in'));
    if (hasST) ScrollTrigger.refresh();
  }

  if (hasST && !REDUCED) {
    // hero parallax + per-letter mask reveal after loader
    gsap.to('.hero-title', { yPercent: -22, opacity: .25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.beam', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // pinned explode story
    const groups = ['.ex-case', '.ex-dial', '.ex-movement', '.ex-hands'];
    const offsets = [{ y: -160 }, { y: -80, x: 120 }, { y: 90, x: -120 }, { y: 30, x: 60 }];
    const caps = $$('.ex-caption');
    const exTl = gsap.timeline({
      scrollTrigger: { trigger: '#explode-wrap', start: 'top top', end: 'bottom bottom', scrub: 1.2 }
    });
    groups.forEach((g, i) => exTl.to(g, { ...offsets[i], duration: 1, ease: 'none' }, i * 1.6));
    exTl.to(groups.map(g => g), { x: 0, y: 0, duration: 2, ease: 'none' });
    // captions via scroll positions
    const wrap = $('#explode-wrap');
    ScrollTrigger.create({
      trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: false,
      onUpdate(st) {
        const stage = Math.min(4, Math.floor(st.progress * 5));
        caps.forEach((c, i) => c.classList.toggle('show', i === stage));
      }
    });

    // marquee speed follows scroll velocity
    const mq = $('.mq-inner');
    let mqX = 0;
    gsap.ticker.add((t, dt) => {
      const vel = ScrollTrigger.getScrollFunc(window) ? 0 : 0;
      const base = .6;
      const boost = Math.min(4, Math.abs((ScrollTrigger.getAll()[0] ? 0 : 0)));
      mqX -= (base + boost);
      const half = mq.children[0].offsetWidth;
      if (-mqX > half) mqX += half;
      mq.style.transform = `translateX(${mqX}px)`;
    });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate(st) {
        const v = Math.abs(ScrollTrigger.getVelocity()) / 400;
        gsap.to(mq, { '--mqboost': Math.min(6, v), duration: .3 });
      }
    });

    // stats count-up
    $$('.count').forEach(el => {
      const to = +el.dataset.to;
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          const o = { v: 0 };
          gsap.to(o, { v: to, duration: 2.4, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) });
        }
      });
    });

    // hairline dividers draw themselves
    $$('.hairline-rule, .hairline-top, .foot-divider').forEach(el => {
      gsap.from(el, { scaleX: 0, opacity: 0, duration: 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  } else {
    // graceful fallback: just reveal everything
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------------- year ---------------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------------- boot ---------------- */
  function fatalRecover() {
    // Last-resort: if script.js crashed before the loader ran, remove any
    // stuck black overlay and reveal content via CSS fallback classes.
    try {
      const l = document.getElementById('loader');
      if (l) l.remove();
      const vh = document.querySelector('#view-home');
      if (vh && !document.querySelector('.view.active')) vh.classList.add('active');
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    } catch (_) {}
  }
  window.addEventListener('error', fatalRecover);

  try {
    renderCartItems();

    // SAFETY NET: even if the loader animation hangs, force-show the site after 3.5s
    setTimeout(() => { killLoader(); doneBoot(); }, 3500);

    function doneBoot() {
      if (window.__patoBooted) return;   // avoid double-boot from the safety net
      window.__patoBooted = true;
      document.body.classList.add('reveal-all'); // successful boot: unlock any CSS-hidden text (idempotent with the guard)
      route(true);
      if (hasGSAP && !REDUCED) {
        gsap.to('.hero-title .w i', { y: 0, duration: 1.2, stagger: .12, ease: 'power4.out', delay: .15 });
        gsap.from('.hero-sub, .hero .btn-magnet, .scroll-hint', { y: 30, opacity: 0, stagger: .15, duration: 1, delay: .6, clearProps: 'all' });
      } else {
        $$('.hero-title .w i').forEach(i => i.style.transform = 'none');
      }
    }

    runLoader(doneBoot);
  } catch (err) {
    console.error('PATO boot error:', err);
    fatalRecover();
  }
})();
