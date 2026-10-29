/* ============================================================
   PATO — main script
   Palette: #BBBFBF #878787 #05AD98 #FFFFFF
   Splash -> hero morph, scrollytelling parallax + reveals,
   micro-animations, product detail pages, basket + checkout.
   ============================================================ */

const cart = new Map();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- money formatting (EGP) ---------- */
const formatPrice = (price) => "LE " + Number(price).toLocaleString("en-EG", { maximumFractionDigits: 0 });

/* ============================================================
   1) SPLASH — short kinetic/glitch intro that MERGES into the hero
   ============================================================ */
(function splash() {
  const el = document.getElementById("splash");
  if (!el) return;
  if (reduceMotion) { el.remove(); return; }

  // after ~1.4s of glitch/kinetic letters, the word scales & flies up to
  // its position in the top bar while the page fades in underneath.
  window.setTimeout(() => {
    el.classList.add("is-morphing");
    document.body.classList.add("site-ready");
  }, 1400);

  window.setTimeout(() => {
    el.remove();
  }, 2050);
})();

/* ============================================================
   2) SCROLLYTELLING — reveal-on-scroll + parallax layers
   ============================================================ */
(function scrollytelling() {
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.18 });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add("is-visible"));
  }

  // gentle parallax on [data-parallax] elements
  const layers = [...document.querySelectorAll("[data-parallax]")];
  if (layers.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      for (const layer of layers) {
        const speed = parseFloat(layer.dataset.parallax) || 0.15;
        const rect = layer.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        layer.style.setProperty("--py", offset.toFixed(1) + "px");
      }
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }
})();

/* ============================================================
   3) MICRO-ANIMATIONS — magnetic buttons + press feedback
   ============================================================ */
(function micros() {
  if (reduceMotion || !window.matchMedia("(hover:hover)").matches) return;
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (ev) => {
      const r = btn.getBoundingClientRect();
      const x = (ev.clientX - r.left - r.width / 2) * 0.18;
      const y = (ev.clientY - r.top - r.height / 2) * 0.18;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
})();

/* ============================================================
   4) TOP BAR — menu toggle + smooth anchor clicks (all working)
   ============================================================ */
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  navLinks.classList.toggle("is-open", !isOpen);
});

// close menu + smooth scroll for in-page links
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (ev) => {
    menuToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
    const href = link.getAttribute("href") || "";
    if (href.startsWith("#")) {
      ev.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  });
});

// logo -> home
document.querySelector(".logo").addEventListener("click", (ev) => {
  ev.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

// "Explore the collection" button also scrolls smoothly
document.querySelectorAll('a.btn[href^="#"]').forEach((a) => {
  a.addEventListener("click", (ev) => {
    ev.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
});

/* ============================================================
   5) PRODUCT DATA + detail page (photos, colors, price, buy icon)
   ============================================================ */
const IMG = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const PRODUCTS = {
  sovereign: {
    name: "The Sovereign Silver",
    tagline: "Signature collection",
    detail: "Automatic · 40 mm · Sapphire crystal",
    price: 1250,
    photos: ["photo-1523275335684-37898b6baf30", "photo-1524592094714-0f0654e20314", "photo-1522312346301-d07f2f69d2c0"],
    colors: [
      { name: "Silver", hex: "#BBBFBF" },
      { name: "Steel Grey", hex: "#878787" },
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "Mint Teal", hex: "#05AD98" }
    ]
  },
  onyx: {
    name: "Chronograph Onyx",
    tagline: "New arrival",
    detail: "Chronograph · 42 mm · Tachymeter bezel",
    price: 2100,
    photos: ["photo-1524805444758-089113d48a6d", "photo-1533139501610-f5d4dbfac34d", "photo-1526033638123-2f6f67560004"],
    colors: [
      { name: "Graphite", hex: "#878787" },
      { name: "Frost", hex: "#BBBFBF" },
      { name: "Teal Dial", hex: "#05AD98" },
      { name: "White Dial", hex: "#FFFFFF" }
    ]
  },
  heritage: {
    name: "Heritage Vintage",
    tagline: "Made to be kept",
    detail: "Hand-wound · 38 mm · Leather strap",
    price: 890,
    photos: ["photo-1542496658-e33a6d0d50f6", "photo-1524592094714-0f0654e20314", "photo-1519296696839-01ba8e3cf1ff"],
    colors: [
      { name: "Sand Grey", hex: "#BBBFBF" },
      { name: "Walnut Dark", hex: "#878787" },
      { name: "Ivory", hex: "#FFFFFF" },
      { name: "Jade Accent", hex: "#05AD98" }
    ]
  },
  rose: {
    name: "PATO Rose Edition",
    tagline: "Limited edition",
    detail: "Automatic · 36 mm · Rose-gold case",
    price: 1750,
    photos: ["photo-1434056886845-dac89ffe9b56", "photo-1547991547-f7a143d078c0", "photo-1523170335258-f5ed11844a49"],
    colors: [
      { name: "Blush Steel", hex: "#BBBFBF" },
      { name: "Warm Grey", hex: "#878787" },
      { name: "Pearl", hex: "#FFFFFF" },
      { name: "Emerald Hand", hex: "#05AD98" }
    ]
  }
};

const productPage = document.getElementById("productPage");
const ppMain = document.getElementById("ppMain");
const ppThumbs = document.getElementById("ppThumbs");
const ppName = document.getElementById("ppName");
const ppDetail = document.getElementById("ppDetail");
const ppPrice = document.getElementById("ppPrice");
const ppTagline = document.getElementById("ppTagline");
const ppSwatches = document.getElementById("ppSwatches");
const ppBuy = document.getElementById("ppBuy");
let currentProduct = null;

function openProduct(id) {
  const p = PRODUCTS[id];
  if (!p) return;
  currentProduct = { id, ...p };

  ppName.textContent = p.name;
  ppDetail.textContent = p.detail;
  ppTagline.textContent = p.tagline;
  ppPrice.textContent = formatPrice(p.price);

  // photos
  ppMain.src = IMG(p.photos[0], 1400);
  ppMain.alt = p.name;
  ppThumbs.replaceChildren();
  p.photos.forEach((pid, i) => {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "pp-thumb" + (i === 0 ? " is-active" : "");
    t.innerHTML = `<img src="${IMG(pid, 240)}" alt="View ${i + 1} of ${p.name}" loading="lazy">`;
    t.addEventListener("click", () => {
      ppMain.classList.remove("fade-in");
      void ppMain.offsetWidth; // restart animation
      ppMain.src = IMG(pid, 1400);
      ppMain.classList.add("fade-in");
      ppThumbs.querySelectorAll(".pp-thumb").forEach((x) => x.classList.remove("is-active"));
      t.classList.add("is-active");
    });
    ppThumbs.append(t);
  });

  // colors
  ppSwatches.replaceChildren();
  p.colors.forEach((c, i) => {
    const s = document.createElement("button");
    s.type = "button";
    s.className = "pp-swatch" + (i === 0 ? " is-active" : "");
    s.style.setProperty("--sw", c.hex);
    s.title = c.name;
    s.setAttribute("aria-label", "Color: " + c.name);
    s.addEventListener("click", () => {
      ppSwatches.querySelectorAll(".pp-swatch").forEach((x) => x.classList.remove("is-active"));
      s.classList.add("is-active");
    });
    ppSwatches.append(s);
  });

  productPage.classList.add("is-open");
  productPage.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  history.pushState({ page: "product" }, "", "#" + id);
}

function closeProduct(pushback = true) {
  productPage.classList.remove("is-open");
  productPage.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  currentProduct = null;
  if (pushback && location.hash.length > 1) history.pushState({ page: "home" }, "", location.pathname);
}

// grid cards open their product page
document.querySelectorAll(".product-card[data-id]").forEach((card) => {
  card.addEventListener("click", () => openProduct(card.dataset.id));
  card.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openProduct(card.dataset.id); }
  });
});

document.querySelector(".pp-close").addEventListener("click", () => closeProduct());
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && productPage.classList.contains("is-open")) closeProduct();
});
window.addEventListener("popstate", () => closeProduct(false));

// Buy icon -> adds to basket with micro-animation
ppBuy.addEventListener("click", () => {
  if (!currentProduct) return;
  addToCart(currentProduct.name, currentProduct.price);
  ppBuy.classList.add("is-bought");
  ppBuy.childNodes[ppBuy.childNodes.length - 1].textContent = " Added ✓";
  setTimeout(() => {
    ppBuy.classList.remove("is-bought");
    ppBuy.childNodes[ppBuy.childNodes.length - 1].textContent = " Buy now";
  }, 1400);
});

/* ============================================================
   6) BASKET + CHECKOUT
   ============================================================ */
const cartDialog = document.getElementById("cart-dialog");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const dialogCount = document.querySelector(".dialog-count");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".checkout-btn");

function renderCart() {
  const quantity = [...cart.values()].reduce((s, i) => s + i.quantity, 0);
  const subtotal = [...cart.values()].reduce((s, i) => s + i.price * i.quantity, 0);
  dialogCount.textContent = `(LE ${quantity})`;
  cartTotal.textContent = formatPrice(subtotal);
  cartEmpty.hidden = quantity > 0;
  checkoutButton.disabled = quantity === 0;
  cartItems.replaceChildren();

  for (const [name, item] of cart) {
    const row = document.createElement("article");
    row.className = "cart-row";
    const left = document.createElement("div");
    const h3 = document.createElement("h3"); h3.textContent = name;
    const qty = document.createElement("p"); qty.textContent = `Quantity: ${item.quantity}`;
    left.append(h3, qty);
    const price = document.createElement("span");
    price.className = "cart-row-price";
    price.textContent = formatPrice(item.price * item.quantity);
    const removeButton = document.createElement("button");
    removeButton.className = "cart-remove";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => { cart.delete(name); renderCart(); });
    row.append(left, price, removeButton);
    cartItems.append(row);
  }
}

function addToCart(name, price) {
  const item = cart.get(name) ?? { price: Number(price), quantity: 0 };
  item.quantity += 1;
  cart.set(name, item);
  renderCart();
}

document.querySelector(".cart-btn").addEventListener("click", () => cartDialog.showModal());
document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (ev) => { if (ev.target === cartDialog) cartDialog.close(); });

// Checkout -> WhatsApp order message
checkoutButton.addEventListener("click", () => {
  if (cart.size === 0) return;
  const lines = [...cart.entries()].map(([name, i]) => `• ${name} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}`);
  const total = [...cart.values()].reduce((s, i) => s + i.price * i.quantity, 0);
  const msg = encodeURIComponent(`Hello PATO! I'd like to order:\n${lines.join("\n")}\nTotal: ${formatPrice(total)}`);
  window.open(`https://wa.me/201280001351?text=${msg}`, "_blank", "noopener");
});

renderCart();
observeReveals();

