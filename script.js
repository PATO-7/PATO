/* ============================================================
   PATO — splash intro, themes, basket & checkout
   ============================================================ */

/* ============ SPLASH SCREEN (2s fullscreen PATO intro) ============ */
const splash = document.getElementById("splash");
if (splash) {
  document.body.classList.add("splash-lock");
  window.setTimeout(() => {
    document.body.classList.remove("splash-lock");
    splash.classList.add("is-hidden");
  }, 2600); // 2s hold + 0.6s fade-out
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

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

let savedTheme = "noir";
try { savedTheme = localStorage.getItem("pato-theme") || "noir"; } catch (e) { /* storage unavailable */ }
applyTheme(savedTheme);

/* ============ BASKET ============ */
const cart = new Map();
const cartDialog = document.getElementById("cart-dialog");
const checkoutDialog = document.getElementById("checkout-dialog");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartCount = document.querySelector(".cart-count");
const dialogCount = document.querySelector(".dialog-count");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".checkout-btn");

const formatPrice = (price) => `${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 0 }).format(price)} EGP`;

/* restore basket from a previous visit */
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
  cartCount.textContent = quantity;
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
    removeButton.addEventListener("click", () => {
      cart.delete(name);
      persistBasket();
      renderCart();
    });
    row.append(removeButton);
    cartItems.append(row);
  }
}

document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.closest(".product-card");
    const name = product.dataset.name;
    const item = cart.get(name) ?? { price: Number(product.dataset.price), quantity: 0 };
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
  });
});

document.querySelector(".cart-btn").addEventListener("click", () => cartDialog.showModal());
document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});

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
checkoutDialog.addEventListener("click", (event) => {
  if (event.target === checkoutDialog) checkoutDialog.close();
});

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

  /* clear the basket now that the order is placed */
  cart.clear();
  persistBasket();
  renderCart();
});

document.querySelector(".continue-btn").addEventListener("click", () => {
  checkoutDialog.close();
  checkoutForm.reset();
  checkoutForm.querySelectorAll(".field-error").forEach((el) => el.classList.remove("field-error"));
});

renderCart();
