const ideas = [
  {
    id: "ffxiv-wall-art",
    type: "wall-art",
    typeLabel: "Light-up wall art",
    title: "FINAL FANTASY XIV",
    note: "An illuminated Eorzea piece with a warm ambient glow for the office wall.",
    image: "assets/ffxiv/hero.jpg",
    icon: "glamour_plate.png",
  },
  {
    id: "amaurot-wall-art",
    type: "wall-art",
    typeLabel: "Light-up wall art",
    title: "Amaurot",
    note: "A dark cityscape silhouette with golden windows and an art-deco edge.",
    image: "assets/ffxiv/emet-selch.jpg",
    icon: "limit_break.png",
  },
  {
    id: "ffx-wall-art",
    type: "wall-art",
    typeLabel: "Light-up wall art",
    title: "FINAL FANTASY X",
    note: "A luminous Spira-inspired piece in ocean blue, violet, and sunset gold.",
    image:
      "https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1200&q=85",
    icon: "achievements.png",
  },
  {
    id: "ffxi-wall-art",
    type: "wall-art",
    typeLabel: "Light-up wall art",
    title: "FINAL FANTASY XI",
    note: "A Vana'diel-inspired skyline or map design with soft edge lighting.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85",
    icon: "journal.png",
  },
  {
    id: "milk-fridge-glass",
    type: "appliance",
    typeLabel: "Office milk fridge",
    title: "Glass-door Mini Fridge",
    note: "A compact white cooler with a clear door for milk, drinks, and snacks.",
    image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1200&q=85",
    icon: "inventory.png",
  },
  {
    id: "milk-fridge-solid",
    type: "appliance",
    typeLabel: "Office milk fridge",
    title: "Quiet White Mini Fridge",
    note: "A discreet solid-door model focused on quiet operation beside her desk.",
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1200&q=85",
    icon: "inventory.png",
  },
  {
    id: "rgb-mousepad-stars",
    type: "office-tech",
    typeLabel: "Extra-large RGB desk mat",
    title: "Crystal Night Desk Mat",
    note: "A full-desk mat with edge lighting and a dark celestial print.",
    image:
      "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=1200&q=85",
    icon: "limit_break.png",
  },
  {
    id: "rgb-mousepad-custom",
    type: "office-tech",
    typeLabel: "Extra-large RGB desk mat",
    title: "Custom Character Desk Mat",
    note: "An oversized illuminated mat customized with Alex's character artwork.",
    image: "assets/ffxiv/graha-tia.jpg",
    icon: "glamour_plate.png",
  },
  {
    id: "white-desktop-clean",
    type: "office-furniture",
    typeLabel: "White desktop",
    title: "Clean White Desktop",
    note: "A bright, durable desktop sized to refresh her existing office setup.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
    icon: "recommendations.png",
  },
  {
    id: "white-desktop-custom",
    type: "office-furniture",
    typeLabel: "White desktop",
    title: "Customized White Desktop",
    note: "A white top with a subtle engraved motif, nameplate, or inset design.",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=85",
    icon: "achievements.png",
  },
  {
    id: "white-chair-ergonomic",
    type: "office-furniture",
    typeLabel: "White office chair",
    title: "Ergonomic Mesh Chair",
    note: "A breathable white chair with adjustable lumbar, arms, and headrest.",
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=85",
    icon: "recommendations.png",
  },
  {
    id: "white-chair-plush",
    type: "office-furniture",
    typeLabel: "White office chair",
    title: "Plush Executive Chair",
    note: "A cushioned white chair for a softer, more relaxed office setup.",
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=85",
    icon: "recommendations.png",
  },
];

const config = window.PUSH_PRESENT_CONFIG;
const savedKey = "push-present-saved-ideas-v2";
const syncKey = "push-present-sync-credentials";
const savedIdeas = new Set(
  JSON.parse(localStorage.getItem(savedKey) || "[]").filter((id) =>
    ideas.some((idea) => idea.id === id),
  ),
);
const grid = document.querySelector("#idea-grid");
const resultsLabel = document.querySelector("#results-label");
const filters = document.querySelectorAll(".filter");
const shareButton = document.querySelector("#share-button");
let activeFilter = "all";
let syncCredentials = null;
let syncTimer = null;

function visibleIdeas() {
  if (activeFilter === "saved") {
    return ideas.filter((idea) => savedIdeas.has(idea.id));
  }
  if (activeFilter === "all") return ideas;
  return ideas.filter((idea) => idea.type === activeFilter);
}

function render() {
  const filteredIdeas = visibleIdeas();
  resultsLabel.textContent = `${filteredIdeas.length} ${
    filteredIdeas.length === 1 ? "option" : "options"
  }`;

  if (filteredIdeas.length === 0) {
    grid.innerHTML = '<p class="empty-state">No favorites chosen yet.</p>';
    return;
  }

  grid.innerHTML = filteredIdeas
    .map(
      (idea) => `
        <article class="idea-card">
          <div class="idea-image-wrap">
            <img class="idea-image" src="${idea.image}" alt="${idea.title}" />
            <img class="idea-icon" src="assets/ffxiv/${idea.icon}" alt="" />
          </div>
          <div class="idea-body">
            <div class="idea-meta">
              <div>
                <p class="idea-type">${idea.typeLabel}</p>
                <h2>${idea.title}</h2>
              </div>
              <button
                class="save-button"
                type="button"
                data-idea-id="${idea.id}"
                aria-pressed="${savedIdeas.has(idea.id)}"
              >
                <img src="assets/ffxiv/limit_break.png" alt="" />
                ${savedIdeas.has(idea.id) ? "Favorite" : "Pick"}
              </button>
            </div>
            <p class="idea-note">${idea.note}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2800);
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
  const remoteIds = new Set(rows.map((row) => row.idea_id));
  savedIdeas.clear();
  ideas.forEach((idea) => {
    if (remoteIds.has(idea.id)) savedIdeas.add(idea.id);
  });
  localStorage.setItem(savedKey, JSON.stringify([...savedIdeas]));
  render();
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
      for (const ideaId of savedIdeas) {
        await rpc("set_shortlist_choice", {
          p_list_id: listId,
          p_access_token: accessToken,
          p_idea_id: ideaId,
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
    showToast("Cloud sync is temporarily unavailable. Picks remain on this device.");
  }
}

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter;
    filters.forEach((item) => item.classList.toggle("is-active", item === filter));
    render();
  });
});

grid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-idea-id]");
  if (!button) return;

  const { ideaId } = button.dataset;
  const selected = !savedIdeas.has(ideaId);
  if (selected) savedIdeas.add(ideaId);
  else savedIdeas.delete(ideaId);
  localStorage.setItem(savedKey, JSON.stringify([...savedIdeas]));
  render();

  if (!syncCredentials) return;
  try {
    await rpc("set_shortlist_choice", {
      p_list_id: syncCredentials.listId,
      p_access_token: syncCredentials.accessToken,
      p_idea_id: ideaId,
      p_selected: selected,
    });
  } catch {
    showToast("That pick is saved locally but has not synced yet.");
  }
});

shareButton.addEventListener("click", async () => {
  const chosenIdeas = ideas.filter((idea) => savedIdeas.has(idea.id));
  const list = chosenIdeas.length
    ? chosenIdeas.map((idea) => `• ${idea.title}`).join("\n")
    : "No favorites chosen yet.";
  const shareData = {
    title: "Alex's Gift of Light",
    text: `My gift favorites:\n\n${list}`,
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

render();
initializeSync();