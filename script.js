const cart = new Map();

/* ============ THEME SWITCHER ============ */
const THEMES = ["light", "dark", "ocean", "blush", "mono"];
const themeButtons = document.querySelectorAll(".theme-btn");

function applyTheme(name) {
  if (!THEMES.includes(name)) name = "light";
  if (name === "light") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", name);
  }
  try { localStorage.setItem("pato-theme", name); } catch (e) { /* storage unavailable */ }
  themeButtons.forEach((btn) => {
    const active = btn.dataset.theme === name;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

let savedTheme = "light";
try { savedTheme = localStorage.getItem("pato-theme") || "light"; } catch (e) { /* storage unavailable */ }
applyTheme(savedTheme);

const cartDialog = document.querySelector("#cart-dialog");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartCount = document.querySelector(".cart-count");
const dialogCount = document.querySelector(".dialog-count");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".checkout-btn");

const formatPrice = (price) => new Intl.NumberFormat("LE", {
  style: "currency",
  currency: "egyptian pound",
  maximumFractionDigits: 0,
}).format(price);

function renderCart() {
  const quantity = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = [...cart.values()].reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = quantity;
  dialogCount.textContent = `(LE ${quantity})`;
  cartTotal.textContent = formatPrice(subtotal);
  cartEmpty.hidden = quantity > 0;
  checkoutButton.disabled = quantity === 0;
  cartItems.replaceChildren();

  for (const [name, item] of cart) {
    const row = document.createElement("article");
    row.className = "cart-row";
    row.innerHTML = `<div><h3>LE ${name}</h3><p>Quantity: LE ${item.quantity}</p></div><span class="cart-row-price">LE ${formatPrice(item.price * item.quantity)}</span>`;
    const removeButton = document.createElement("button");
    removeButton.className = "cart-remove";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      cart.delete(name);
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
    renderCart();
    button.classList.add("is-added");
    button.setAttribute("aria-label", `LE ${name} added to bag`);
    button.innerHTML = 'Added to bag <span aria-hidden="true">✓</span>';
    window.setTimeout(() => {
      button.classList.remove("is-added");
      button.setAttribute("aria-label", `Add LE ${name} to bag`);
      button.innerHTML = 'Add to bag <span aria-hidden="true">+</span>';
    }, 1400);
  });
});

document.querySelector(".cart-btn").addEventListener("click", () => cartDialog.showModal());
document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  navLinks.classList.toggle("is-open", !isOpen);
});
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    navLinks.classList.remove("is-open");
  });
});

renderCart();