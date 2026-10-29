/* ============================================================
   PATO — animated splash, scroll flow (hero → watches),
   fullscreen photo viewer, basket & checkout
   ============================================================ */

/* ============ SPLASH SCREEN (animated wallpaper behind PATO) ============ */
const splash = document.getElementById("splash");
if (splash) {
  document.body.classList.add("splash-lock");

  /* rotate wallpaper images inside the splash */
  const sbImgs = splash.querySelectorAll(".sb-img");
  if (sbImgs.length > 1) {
    let sbIndex = 0;
    window.setInterval(() => {
      sbImgs[sbIndex].classList.remove("is-active");
      sbIndex = (sbIndex + 1) % sbImgs.length;
      const next = sbImgs[sbIndex];
      next.classList.add("is-active");
      next.style.animation = "none";
      void next.offsetWidth;
      next.style.animation = "";
    }, 1500);
  }

  window.setTimeout(() => {
    document.body.classList.remove("splash-lock");
    splash.classList.add("is-hidden");
  }, 3600); // 3s hold + 0.6s fade-out
}

/* ============ FIXED DARK GENTLE THEME (no switcher UI) ============ */
document.documentElement.removeAttribute("data-theme");
try { localStorage.removeItem("pato-theme"); } catch (e) { /* storage unavailable */ }

/* ============ CATALOGUE ============ */
const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=85`;
const PRODUCTS = [
  { id: "sovereign", name: "The Sovereign Silver", detail: "Automatic · 40 mm", price: 64900, tag: "Bestseller",
    photos: [IMG("photo-1523275335684-37898b6baf30"), IMG("photo-1524592094714-0f0654e20314"), IMG("photo-1522312352255-9d8153d4d2d8")] },
  { id: "onyx", name: "Chronograph Onyx", detail: "Chronograph · 42 mm", price: 108500, tag: "New",
    photos: [IMG("photo-1524805444758-089113d48a6d"), IMG("photo-1533139501650-bd3c0b4e411a"), IMG("photo-1523170335258-f5ed11844a49")] },
  { id: "heritage", name: "Heritage Vintage", detail: "Hand-wound · 38 mm", price: 45900, tag: "Offer", oldPrice: 52900,
    photos: [IMG("photo-1542496658-e33a6d0d50f6"), IMG("photo-1508057198844-421ef382668a"), IMG("photo-1434056886845-dac89ffe9b56")] },
  { id: "rose", name: "PATO Rose Edition", detail: "Automatic · 36 mm", price: 89500, tag: "Offer", oldPrice: 97500,
    photos: [IMG("photo-1434056886845-dac89ffe9b56"), IMG("photo-1587836374828-8b3f44ae0e1a"), IMG("photo-1564423174718-4f2b2b1c4b1f")] },
  { id: "meridian", name: "The Meridian", detail: "Automatic · 38 mm", price: 72500, tag: "",
    photos: [IMG("photo-1614250318805-3de75d1c7a00"), IMG("photo-1523275335684-37898b6baf30"), IMG("photo-1524805444758-089113d48a6d")] },
  { id: "navigator", name: "Navigator Steel", detail: "Quartz · 41 mm", price: 38900, tag: "Offer", oldPrice: 44900,
    photos: [IMG("photo-1522312352255-9d8153d4d2d8"), IMG("photo-1542496658-e33a6d0d50f6"), IMG("photo-1533139501650-bd3c0b4e411a")] },
];
const formatPrice = (price) => `${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(price)} EGP`;

/* ============ PAGES (home + shop are one scroll flow) ============ */
const pages = document.querySelectorAll(".page");
const shopSection = document.getElementById("page-shop");

function showPage(id) {
  closeViewer();
  pages.forEach((p) => p.classList.toggle("is-active", p.id === id));
  if (id === "page-home") {
    shopSection.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    shopSection.hidden = true;
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

document.body.addEventListener("click", (event) => {
  const link = event.target.closest("[data-nav]");
  if (!link) return;
  event.preventDefault();
  const target = link.dataset.nav;
  closeMenuSheet();
  if (target === "home") showPage("page-home");
  else if (target === "shop") {
    showPage("page-home");
    renderProducts(PRODUCTS);
    window.setTimeout(() => shopSection.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }
  else if (target === "offers") {
    showPage("page-home");
    renderProducts(PRODUCTS.filter((p) => p.oldPrice));
    window.setTimeout(() => shopSection.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }
  else if (target === "contact") showPage("page-contact");
  else if (target === "pato") showPage("page-pato");
});

/* ============ HALF-PAGE MENU SHEET ============ */
const menuBtn = document.getElementById("menu-btn");
const menuSheet = document.getElementById("menu-sheet");
const menuBackdrop = document.getElementById("menu-backdrop");

function openMenuSheet() {
  if (!menuSheet || menuBtn.getAttribute("aria-expanded") === "true") return;
  menuBackdrop.hidden = false;
  menuSheet.hidden = false;
  menuBtn.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => {
    menuBackdrop.classList.add("is-open");
    menuSheet.classList.add("is-open");
  });
}

function closeMenuSheet() {
  if (!menuSheet || menuSheet.hidden) return;
  menuBtn && menuBtn.setAttribute("aria-expanded", "false");
  menuBackdrop.classList.remove("is-open");
  menuSheet.classList.remove("is-open");
  window.setTimeout(() => { menuBackdrop.hidden = true; menuSheet.hidden = true; }, 280);
}

if (menuBtn) menuBtn.addEventListener("click", openMenuSheet);
if (menuBackdrop) menuBackdrop.addEventListener("click", closeMenuSheet);
if (menuSheet) {
  menuSheet.querySelector(".sheet-close").addEventListener("click", closeMenuSheet);
  /* when a nav item inside the sheet is clicked, the body listener closes it;
     direct WhatsApp link should also dismiss the sheet visually */
  menuSheet.querySelectorAll('a[href^="https://wa.me"]').forEach((a) => a.addEventListener("click", closeMenuSheet));
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenuSheet(); });

/* ============ PRODUCT GRID (tap card → fullscreen photos) ============ */
const productGrid = document.getElementById("product-grid");

function renderProducts(list) {
  productGrid.replaceChildren();
  list.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = product.id;
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.photos[0]}" alt="${product.name}" loading="lazy">
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ""}
      </div>
      <div class="product-info">
        <div><h3>${product.name}</h3><p class="product-detail">${product.detail}</p></div>
        <p class="price">${formatPrice(product.price)}${product.oldPrice ? `<s>${formatPrice(product.oldPrice)}</s>` : ""}</p>
      </div>
      <button class="add-to-cart-btn" type="button" data-id="${product.id}">Add to basket <span aria-hidden="true">+</span></button>`;
    card.querySelector(".product-image").addEventListener("click", () => openViewer(product.id));
    card.querySelector("h3").addEventListener("click", () => openViewer(product.id));
    productGrid.append(card);
  });
}

/* ============ FULLSCREEN PHOTO VIEWER (gentle professional animation) ============ */
const viewer = document.getElementById("fullscreen-viewer");
const fvMain = viewer.querySelector(".fv-main");
const fvName = viewer.querySelector(".fv-name");
const fvDetail = viewer.querySelector(".fv-detail");
const fvPrice = viewer.querySelector(".fv-price");
const fvThumbs = viewer.querySelector(".fv-thumbs");
const fvAdd = viewer.querySelector(".fv-add");
let currentProduct = null;
let currentPhoto = 0;

function openViewer(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  currentProduct = product;
  currentPhoto = 0;
  fvName.textContent = product.name;
  fvDetail.textContent = product.detail;
  fvPrice.innerHTML = `${formatPrice(product.price)}${product.oldPrice ? ` <s>${formatPrice(product.oldPrice)}</s>` : ""}`;
  fvThumbs.replaceChildren();
  product.photos.forEach((src, i) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "fv-thumb";
    thumb.setAttribute("aria-label", `Photo ${i + 1}`);
    thumb.innerHTML = `<img src="${src}" alt="">`;
    thumb.addEventListener("click", () => setPhoto(i));
    fvThumbs.append(thumb);
  });
  setPhoto(0);
  viewer.hidden = false;
  requestAnimationFrame(() => viewer.classList.add("is-open"));
  document.body.classList.add("viewer-lock");
}

function setPhoto(index) {
  if (!currentProduct) return;
  currentPhoto = (index + currentProduct.photos.length) % currentProduct.photos.length;
  /* gentle crossfade: fade out, swap, fade in */
  fvMain.classList.remove("is-swapping");
  void fvMain.offsetWidth;
  fvMain.classList.add("is-swapping");
  window.setTimeout(() => {
    fvMain.src = currentProduct.photos[currentPhoto];
    fvMain.alt = `${currentProduct.name} — photo ${currentPhoto + 1}`;
    fvMain.classList.remove("is-swapping");
  }, 180);
  viewer.querySelectorAll(".fv-thumb").forEach((t, i) => t.classList.toggle("is-active", i === currentPhoto));
}

function closeViewer() {
  if (viewer.hidden) return;
  viewer.classList.remove("is-open");
  document.body.classList.remove("viewer-lock");
  window.setTimeout(() => { viewer.hidden = true; currentProduct = null; }, 300);
}

viewer.querySelector(".fv-close").addEventListener("click", closeViewer);
viewer.querySelector(".fv-backdrop").addEventListener("click", closeViewer);
viewer.querySelector(".prev").addEventListener("click", () => setPhoto(currentPhoto - 1));
viewer.querySelector(".next").addEventListener("click", () => setPhoto(currentPhoto + 1));
document.addEventListener("keydown", (e) => {
  if (viewer.hidden) return;
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowLeft") setPhoto(currentPhoto - 1);
  if (e.key === "ArrowRight") setPhoto(currentPhoto + 1);
});

/* swipe left/right on the fullscreen photo */
let touchX = null;
fvMain.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
fvMain.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 45) setPhoto(currentPhoto + (dx < 0 ? 1 : -1));
  touchX = null;
});

fvAdd.addEventListener("click", () => {
  if (!currentProduct) return;
  addToBasket(currentProduct.name, currentProduct.price, fvAdd);
});

/* ============ BASKET ============ */
const cart = new Map();
const cartDialog = document.getElementById("cart-dialog");
const checkoutDialog = document.getElementById("checkout-dialog");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const dialogCount = document.querySelector(".dialog-count");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".checkout-btn");

try {
  const saved = JSON.parse(localStorage.getItem("pato-basket") || "[]");
  saved.forEach(([name, item]) => { if (name && item && typeof item.price === "number") cart.set(name, { price: item.price, quantity: Number(item.quantity) || 1 }); });
} catch (e) { /* ignore corrupt storage */ }

function persistBasket() {
  try { localStorage.setItem("pato-basket", JSON.stringify([...cart.entries()])); } catch (e) { /* storage unavailable */ }
}

function subtotal() {
  return [...cart.values()].reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
  const quantity = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  dialogCount.textContent = `(${quantity})`;
  cartTotal.textContent = formatPrice(subtotal());
  cartEmpty.hidden = quantity > 0;
  checkoutButton.disabled = quantity === 0;
  cartItems.replaceChildren();

  for (const [name, item] of cart) {
    const row = document.createElement("article");
    row.className = "cart-row";
    row.innerHTML = `<div><h3>${name}</h3><p>Quantity: ${item.quantity} · ${formatPrice(item.price)} each</p></div><span class="cart-row-price">${formatPrice(item.price * item.quantity)}</span>`;
    const removeButton = document.createElement("button");
    removeButton.className = "cart-remove";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => { cart.delete(name); persistBasket(); renderCart(); });
    row.append(removeButton);
    cartItems.append(row);
  }
}

function addToBasket(name, price, button) {
  const item = cart.get(name) ?? { price, quantity: 0 };
  item.quantity += 1;
  cart.set(name, item);
  persistBasket();
  renderCart();
  button.classList.add("is-added");
  button.innerHTML = 'Added to basket <span aria-hidden="true">✓</span>';
  window.setTimeout(() => {
    button.classList.remove("is-added");
    button.innerHTML = 'Add to basket <span aria-hidden="true">+</span>';
  }, 1400);
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-to-cart-btn[data-id]");
  if (!button) return;
  const product = PRODUCTS.find((p) => p.id === button.dataset.id);
  if (product) addToBasket(product.name, product.price, button);
});

document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => { if (event.target === cartDialog) cartDialog.close(); });

/* basket icon on the first page opens the saved basket */
const basketBtn = document.getElementById("basket-btn");
if (basketBtn) basketBtn.addEventListener("click", () => { closeMenuSheet(); renderCart(); cartDialog.showModal(); });

/* ============ CHECKOUT ============ */
const SHIPPING_FLAT = 100;
const FREE_SHIPPING_FROM = 5000;
const summaryItems = document.querySelector(".summary-items");
const sumSubtotal = document.querySelector(".sum-subtotal");
const sumShipping = document.querySelector(".sum-shipping");
const sumTotal = document.querySelector(".sum-total");
const checkoutForm = document.getElementById("checkout-form");
const orderSuccess = document.querySelector(".order-success");
const successRef = document.querySelector(".success-ref");

function shippingFor(amount) {
  if (amount >= FREE_SHIPPING_FROM) return 0;
  return amount > 0 ? SHIPPING_FLAT : null;
}

function renderSummary() {
  const sub = subtotal();
  const ship = shippingFor(sub);
  summaryItems.replaceChildren();
  for (const [name, item] of cart) {
    const row = document.createElement("div");
    row.className = "summary-row";
    row.innerHTML = `<span>${item.quantity} × ${name}</span><strong>${formatPrice(item.price * item.quantity)}</strong>`;
    summaryItems.append(row);
  }
  sumSubtotal.textContent = formatPrice(sub);
  sumShipping.textContent = ship === null ? "—" : ship === 0 ? "Free" : formatPrice(ship);
  sumTotal.textContent = ship === null ? "0 EGP" : formatPrice(sub + ship);
}

checkoutButton.addEventListener("click", () => {
  cartDialog.close();
  checkoutForm.hidden = false;
  orderSuccess.hidden = true;
  renderSummary();
  checkoutDialog.showModal();
});

document.querySelector(".checkout-close").addEventListener("click", () => checkoutDialog.close());
checkoutDialog.addEventListener("click", (event) => { if (event.target === checkoutDialog) checkoutDialog.close(); });

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(checkoutForm);
  const fields = [
    { el: checkoutForm.elements.name, ok: String(data.get("name") || "").trim().length >= 3 },
    { el: checkoutForm.elements.phone, ok: /^01[0-9]{9}$/.test(String(data.get("phone") || "").replace(/\s|-/g, "")) },
    { el: checkoutForm.elements.address, ok: String(data.get("address") || "").trim().length >= 10 },
  ];
  let valid = true;
  fields.forEach(({ el, ok }) => {
    el.classList.toggle("field-error", !ok);
    if (!ok) { valid = false; if (el.reportValidity) { try { el.setCustomValidity(""); el.reportValidity(); } catch (e) {} } }
  });
  if (!valid) return;

  const ref = `PATO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  successRef.textContent = `Order reference: ${ref}`;
  checkoutForm.hidden = true;
  orderSuccess.hidden = false;

  cart.clear();
  persistBasket();
  renderCart();
});

document.querySelector(".continue-btn").addEventListener("click", () => {
  checkoutDialog.close();
  checkoutForm.reset();
  checkoutForm.querySelectorAll(".field-error").forEach((el) => el.classList.remove("field-error"));
  showPage("page-home");
  window.setTimeout(() => shopSection.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
});

renderProducts(PRODUCTS);
renderCart();
