const categories = window.PUSH_PRESENT_CATEGORIES;
const products = window.PUSH_PRESENT_PRODUCTS;
const config = window.PUSH_PRESENT_CONFIG;
const savedKey = "push-present-saved-products-v3";
const syncKey = "push-present-sync-credentials";
const categoryNav = document.querySelector("#category-nav");
const categoryDecks = document.querySelector("#category-decks");
const shareButton = document.querySelector("#share-button");
const selectedProducts = new Set();
const categoryArt = [
  "emet-selch.webp",
  "graha-tia.webp",
  "aymeric.webp",
  "estinien.webp",
  "hythlodaeus.webp",
];
let syncCredentials = null;
let syncTimer = null;

function productById(productId) {
  return products.find((product) => product.id === productId);
}

function selectLocally(productId) {
  const product = productById(productId);
  if (!product) return false;

  const wasSelected = selectedProducts.has(productId);
  products
    .filter((candidate) => candidate.category === product.category)
    .forEach((candidate) => selectedProducts.delete(candidate.id));

  if (!wasSelected) selectedProducts.add(productId);
  localStorage.setItem(savedKey, JSON.stringify([...selectedProducts]));
  return !wasSelected;
}

function restoreLocalSelections() {
  const stored = JSON.parse(localStorage.getItem(savedKey) || "[]");
  stored.forEach((productId) => selectLocally(productId));
}

function categoryProducts(categoryId) {
  return products.filter((product) => product.category === categoryId);
}

function renderProduct(product, index, total) {
  const selected = selectedProducts.has(product.id);
  const specs = product.specs.map((spec) => `<li>${spec}</li>`).join("");
  return `
    <article class="product-card${selected ? " is-selected" : ""}" data-product-id="${product.id}">
      <div class="product-image-wrap">
        ${product.image ? `<img class="product-image" src="${product.image}" alt="${product.title}" />` : `<div class="product-image product-image--pending"><span>Product image pending</span></div>`}
        <span class="product-position">${index + 1} / ${total}</span>
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
      </div>
      <div class="product-body">
        <p class="product-retailer">${product.retailer}</p>
        <h3>${product.title}</h3>
        <div class="product-price-row">
          <strong>${product.price}</strong>
          <span>${product.rating}</span>
        </div>
        <p class="product-note">${product.note}</p>
        <ul class="product-specs">${specs}</ul>
        <div class="product-actions">
          <a href="${product.url}" target="_blank" rel="noopener noreferrer">View product</a>
          <button
            class="choose-button"
            type="button"
            data-choose-product="${product.id}"
            aria-pressed="${selected}"
          >
            <img src="assets/ffxiv/limit_break.png" alt="" />
            <span>${selected ? "Lulu's pick" : "Choose"}</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderCarousel(options, categoryTitle) {
  const slides = options
    .map(
      (product, index) =>
        `<div class="product-slide">${renderProduct(product, index, options.length)}</div>`,
    )
    .join("");
  return `
    <div class="carousel-shell">
      <div class="product-reel" aria-label="${categoryTitle} options">
        <div class="product-track">${slides}</div>
      </div>
      <div class="carousel-controls">
        <button class="carousel-button" type="button" data-carousel-step="-1" aria-label="Previous option">‹</button>
        <span class="carousel-status" aria-live="polite">1 / ${options.length}</span>
        <button class="carousel-button" type="button" data-carousel-step="1" aria-label="Next option">›</button>
      </div>
    </div>
  `;
}

function render() {
  categoryNav.innerHTML = categories
    .map(
      (category) => `
        <a class="filter" href="#category-${category.id}">
          <img src="assets/ffxiv/${category.icon}" alt="" />
          ${category.title}
        </a>
      `,
    )
    .join("");

  categoryDecks.innerHTML = categories
    .map((category, categoryIndex) => {
      const options = categoryProducts(category.id);
      const selected = options.find((product) => selectedProducts.has(product.id));
      return `
        <section
          class="category-section"
          id="category-${category.id}"
          style="--category-art: url('assets/art/${categoryArt[categoryIndex % categoryArt.length]}')"
        >
          <div class="category-content">
            <header class="category-header">
              <div>
                <p class="section-kicker">${category.subtitle}</p>
                <h2>${category.title}</h2>
              </div>
              <span class="category-choice" data-category-choice="${category.id}">
                ${selected ? "1 chosen" : "Choose 1"}
              </span>
            </header>
            <p class="category-note">${category.note}</p>
            ${renderCarousel(options, category.title)}
          </div>
        </section>
      `;
    })
    .join("");

  initializeCategoryMotion();
  initializeCarouselLoops();
}

function initializeCarouselLoops() {
  document.querySelectorAll(".carousel-shell").forEach((carousel) => {
    const track = carousel.querySelector(".product-track");
    const slides = [...track.children];
    const status = carousel.querySelector(".carousel-status");
    let index = 0;
    let startX = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
      status.textContent = `${index + 1} / ${slides.length}`;
    };

    carousel.addEventListener("click", (event) => {
      const button = event.target.closest("[data-carousel-step]");
      if (button) show(index + Number(button.dataset.carouselStep));
    });
    track.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener("pointerup", (event) => {
      if (startX === null) return;
      const distance = event.clientX - startX;
      startX = null;
      if (Math.abs(distance) >= 45) show(index + (distance < 0 ? 1 : -1));
    });
    track.addEventListener("pointercancel", () => {
      startX = null;
    });
  });
}

function initializeCategoryMotion() {
  const sections = document.querySelectorAll(".category-section");
  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-active"));
    return;
  }

  document.documentElement.classList.add("has-motion");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { threshold: 0.55 },
  );
  sections.forEach((section) => observer.observe(section));
}

function updateCategorySelection(categoryId) {
  const selected = categoryProducts(categoryId).find((product) =>
    selectedProducts.has(product.id),
  );
  document.querySelector(`[data-category-choice="${categoryId}"]`).textContent = selected
    ? "1 chosen"
    : "Choose 1";

  categoryProducts(categoryId).forEach((product) => {
    const card = document.querySelector(`[data-product-id="${product.id}"]`);
    const button = document.querySelector(`[data-choose-product="${product.id}"]`);
    const isSelected = selectedProducts.has(product.id);
    card.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    button.querySelector("span").textContent = isSelected ? "Lulu's pick" : "Choose";
  });
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function credentialsFromHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const listId = params.get("list");
  const accessToken = params.get("key");
  return listId && accessToken ? { listId, accessToken } : null;
}

function shareUrl() {
  if (!syncCredentials) return location.href;
  const url = new URL(location.href);
  url.hash = new URLSearchParams({
    list: syncCredentials.listId,
    key: syncCredentials.accessToken,
  });
  return url.toString();
}

async function rpc(name, body) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: config.supabaseKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return null;
  return response.json();
}

async function refreshFromRemote() {
  if (!syncCredentials) return;
  const rows = await rpc("get_shortlist", {
    p_list_id: syncCredentials.listId,
    p_access_token: syncCredentials.accessToken,
  });
  selectedProducts.clear();
  rows.forEach(({ idea_id: productId }) => {
    if (productById(productId)) selectedProducts.add(productId);
  });
  localStorage.setItem(savedKey, JSON.stringify([...selectedProducts]));
  categories.forEach((category) => updateCategorySelection(category.id));
}

async function initializeSync() {
  if (!config?.supabaseUrl || !config?.supabaseKey) return;

  try {
    syncCredentials = credentialsFromHash();
    if (!syncCredentials) {
      syncCredentials = JSON.parse(localStorage.getItem(syncKey) || "null");
    }

    if (!syncCredentials) {
      const accessToken = randomToken();
      const listId = await rpc("create_shortlist", { p_access_token: accessToken });
      syncCredentials = { listId, accessToken };
      for (const productId of selectedProducts) {
        const product = productById(productId);
        await rpc("set_shortlist_choice", {
          p_list_id: listId,
          p_access_token: accessToken,
          p_category_id: product.category,
          p_idea_id: productId,
          p_selected: true,
        });
      }
    } else {
      await refreshFromRemote();
    }

    localStorage.setItem(syncKey, JSON.stringify(syncCredentials));
    history.replaceState(null, "", shareUrl());
    syncTimer = window.setInterval(() => refreshFromRemote().catch(() => {}), 10000);
  } catch {
    syncCredentials = null;
    showToast("Cloud sync is temporarily unavailable. Choices remain on this device.");
  }
}

categoryDecks.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-choose-product]");
  if (!button) return;

  const product = productById(button.dataset.chooseProduct);
  const selected = selectLocally(product.id);
  updateCategorySelection(product.category);

  if (!syncCredentials) return;
  try {
    await rpc("set_shortlist_choice", {
      p_list_id: syncCredentials.listId,
      p_access_token: syncCredentials.accessToken,
      p_category_id: product.category,
      p_idea_id: product.id,
      p_selected: selected,
    });
  } catch {
    showToast("That choice is saved locally but has not synced yet.");
  }
});

shareButton.addEventListener("click", async () => {
  const chosen = categories
    .map((category) => {
      const product = categoryProducts(category.id).find((item) =>
        selectedProducts.has(item.id),
      );
      return product ? `${category.title}: ${product.title}` : null;
    })
    .filter(Boolean);
  const shareData = {
    title: "Lulu Prissypants' Wishlist",
    text: chosen.length ? chosen.join("\n") : "Lulu has not chosen her loot yet.",
    url: shareUrl(),
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
    showToast("Shared wishlist link copied.");
  } catch (error) {
    if (error.name !== "AbortError") showToast("Unable to share the wishlist.");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshFromRemote().catch(() => {});
});
window.addEventListener("beforeunload", () => window.clearInterval(syncTimer));

restoreLocalSelections();
render();
initializeSync();
