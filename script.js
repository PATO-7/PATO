/* ============================================================
   PATO — splash, half-menu pages, catalogue, photo viewer,
   basket & checkout
   ============================================================ */

/* ============ SPLASH SCREEN (3s fullscreen PATO intro) ============ */
const splash = document.getElementById("splash");
if (splash) {
  document.body.classList.add("splash-lock");
  window.setTimeout(() => {
    document.body.classList.remove("splash-lock");
    splash.classList.add("is-hidden");
  }, 3600); // 3s hold + 0.6s fade-out
}

/* ============ THEME SWITCHER (5 dark gentle themes) ============ */
const THEMES = ["noir", "mocha", "slate", "olive", "plum"];
const themeButtons = document.querySelectorAll(".theme-btn");

function applyTheme(name) {
  if (!THEMES.includes(name)) name = "noir";
  if (name === "noir") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", name);
  }
  try { localStorage.setItem("pato-theme", name); } catch (e) { /* storage unavailable */ }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#101411");
  themeButtons.forEach((btn) => {
    const active = btn.dataset.theme === name;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

themeButtons.forEach((btn) => btn.addEventListener("click", () => applyTheme(btn.dataset.theme)));

let savedTheme = "noir";
try { savedTheme = localStorage.getItem("pato-theme") || "noir"; } catch (e) { /* storage unavailable */ }
applyTheme(savedTheme);

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
const OFFER_IDS = PRODUCTS.filter((p) => p.oldPrice).map((p) => p.id);

const formatPrice = (price) => `${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(price)} EGP`;

/* ============ PAGES + HALF MENU ============ */
const pages = document.querySelectorAll(".page");
const halfMenu = document.getElementById("half-menu");
const menuToggle = document.querySelector(".menu-toggle");
const shopTitle = document.getElementById("shop-title");
const shopEyebrow = document.getElementById("shop-eyebrow");

function openMenu() {
  halfMenu.hidden = false;
  requestAnimationFrame(() => halfMenu.classList.add("is-open"));
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.classList.add("is-open");
}
function closeMenu() {
  halfMenu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.classList.remove("is-open");
  window.setTimeout(() => { halfMenu.hidden = true; }, 260);
}
menuToggle.addEventListener("click", () => (halfMenu.hidden ? openMenu() : closeMenu()));
document.querySelector(".hm-close").addEventListener("click", closeMenu);
halfMenu.addEventListener("click", (e) => { if (e.target === halfMenu) closeMenu(); });

function showPage(id) {
  closeMenu();
  hideViewer();
  pages.forEach((p) => p.classList.toggle("is-active", p.id === id));
  window.scrollTo({ top: 0, behavior: "auto" });
}

document.body.addEventListener("click", (event) => {
  const link = event.target.closest("[data-nav]");
  if (!link) return;
  event.preventDefault();
  const target = link.dataset.nav;
  if (target === "home") showPage("page-home");
  else if (target === "category") { renderProducts(PRODUCTS); shopTitle.textContent = "Our watches"; shopEyebrow.textContent = "Considered in every detail"; showPage("page-shop"); }
  else if (target === "offers") { renderProducts(PRODUCTS.filter((p) => OFFER_IDS.includes(p.id))); shopTitle.textContent = "Special offers"; shopEyebrow.textContent = "Limited time · reduced prices"; showPage("page-shop"); }
  else if (target === "contact") showPage("page-contact");
  else if (target === "pato") showPage("page-pato");
});

/* ============ PRODUCT GRID (tap card → photos on same page) ============ */
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
    card.querySelector("img").addEventListener("click", () => openViewer(product.id));
    card.querySelector("h3").addEventListener("click", () => openViewer(product.id));
    productGrid.append(card);
  });
}

/* ============ PHOTO VIEWER (same page, under the grid) ============ */
const viewer = document.getElementById("photo-viewer");
const pvMain = viewer.querySelector(".pv-main");
const pvName = viewer.querySelector(".pv-name");
const pvDetail = viewer.querySelector(".pv-detail");
const pvPrice = viewer.querySelector(".pv-price");
const pvThumbs = viewer.querySelector(".pv-thumbs");
const pvAdd = viewer.querySelector(".pv-add");
let currentProduct = null;
let currentPhoto = 0;

function openViewer(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  currentProduct = product;
  currentPhoto = 0;
  pvName.textContent = product.name;
  pvDetail.textContent = product.detail;
  pvPrice.innerHTML = `${formatPrice(product.price)}${product.oldPrice ? ` <s>${formatPrice(product.oldPrice)}</s>` : ""}`;
  pvThumbs.replaceChildren();
  product.photos.forEach((src, i) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "pv-thumb";
    thumb.setAttribute("aria-label", `Photo ${i + 1}`);
    thumb.innerHTML = `<img src="${src}" alt="">`;
    thumb.addEventListener("click", () => setPhoto(i));
    pvThumbs.append(thumb);
  });
  setPhoto(0);
  viewer.hidden = false;
  viewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setPhoto(index) {
  if (!currentProduct) return;
  currentPhoto = (index + currentProduct.photos.length) % currentProduct.photos.length;
  pvMain.src = currentProduct.photos[currentPhoto];
  pvMain.alt = `${currentProduct.name} — photo ${currentPhoto + 1}`;
  viewer.querySelectorAll(".pv-thumb").forEach((t, i) => t.classList.toggle("is-active", i === currentPhoto));
}

function hideViewer() {
  viewer.hidden = true;
  currentProduct = null;
}

viewer.querySelector(".pv-close").addEventListener("click", hideViewer);
viewer.querySelector(".prev").addEventListener("click", () => setPhoto(currentPhoto - 1));
viewer.querySelector(".next").addEventListener("click", () => setPhoto(currentPhoto + 1));

pvAdd.addEventListener("click", () => {
  if (!currentProduct) return;
  addToBasket(currentProduct.name, currentProduct.price, pvAdd);
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

document.querySelector(".cart-btn").addEventListener("click", () => cartDialog.showModal());
document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => { if (event.target === cartDialog) cartDialog.close(); });

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
  showPage("page-shop");
});

renderProducts(PRODUCTS);
renderCart();

/* ============ HERO SLIDESHOW (animated wallpaper) ============ */
const heroImages = document.querySelectorAll(".hs-img");
if (heroImages.length > 1) {
  let heroIndex = 0;
  window.setInterval(() => {
    heroImages[heroIndex].classList.remove("is-active");
    heroIndex = (heroIndex + 1) % heroImages.length;
    const next = heroImages[heroIndex];
    next.classList.add("is-active");
    /* restart ken-burns animation */
    next.style.animation = "none";
    void next.offsetWidth;
    next.style.animation = "";
  }, 4500);
}
