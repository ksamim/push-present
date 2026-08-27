const ideas = [
  {
    id: "birthstone-ring",
    type: "jewelry",
    typeLabel: "Adornments",
    title: "Birthstone Ring",
    note: "A luminous band set with the baby's birthstone, made for every daily quest.",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",
    icon: "glamour_plate.png",
  },
  {
    id: "initial-necklace",
    type: "jewelry",
    typeLabel: "Adornments",
    title: "Initial Necklace",
    note: "A delicate gold chain bearing a tiny initial charm close to the heart.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
    icon: "glamour_plate.png",
  },
  {
    id: "keepsake-box",
    type: "keepsake",
    typeLabel: "Keepsakes",
    title: "Keepsake Box",
    note: "A treasure coffer for hospital bands, first notes, and early memories.",
    image:
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=85",
    icon: "inventory.png",
  },
  {
    id: "engraved-bracelet",
    type: "jewelry",
    typeLabel: "Adornments",
    title: "Engraved Bracelet",
    note: "A slender heirloom engraved with a name, date, or private message.",
    image:
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1200&q=85",
    icon: "achievements.png",
  },
  {
    id: "portrait-session",
    type: "keepsake",
    typeLabel: "Keepsakes",
    title: "Family Portrait Session",
    note: "A quiet session to preserve the party at the very start of its adventure.",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85",
    icon: "journal.png",
  },
  {
    id: "spa-retreat",
    type: "comfort",
    typeLabel: "Comforts",
    title: "Restoration Day",
    note: "A restorative spa day with every detail arranged in advance.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    icon: "recommendations.png",
  },
];

const savedKey = "push-present-saved-ideas";
const savedIdeas = new Set(JSON.parse(localStorage.getItem(savedKey) || "[]"));
const grid = document.querySelector("#idea-grid");
const resultsLabel = document.querySelector("#results-label");
const filters = document.querySelectorAll(".filter");
const shareButton = document.querySelector("#share-button");
let activeFilter = "all";

function visibleIdeas() {
  if (activeFilter === "saved") {
    return ideas.filter((idea) => savedIdeas.has(idea.id));
  }

  if (activeFilter === "all") {
    return ideas;
  }

  return ideas.filter((idea) => idea.type === activeFilter);
}

function render() {
  const filteredIdeas = visibleIdeas();
  resultsLabel.textContent = `${filteredIdeas.length} ${
    filteredIdeas.length === 1 ? "treasure" : "treasures"
  }`;

  if (filteredIdeas.length === 0) {
    grid.innerHTML = '<p class="empty-state">No treasures chosen yet.</p>';
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
                ${savedIdeas.has(idea.id) ? "Chosen" : "Choose"}
              </button>
            </div>
            <p class="idea-note">${idea.note}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter;
    filters.forEach((item) => item.classList.toggle("is-active", item === filter));
    render();
  });
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-idea-id]");
  if (!button) return;

  const { ideaId } = button.dataset;
  if (savedIdeas.has(ideaId)) {
    savedIdeas.delete(ideaId);
  } else {
    savedIdeas.add(ideaId);
  }

  localStorage.setItem(savedKey, JSON.stringify([...savedIdeas]));
  render();
});

function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

shareButton.addEventListener("click", async () => {
  const chosenIdeas = ideas.filter((idea) => savedIdeas.has(idea.id));
  const list = chosenIdeas.length
    ? chosenIdeas.map((idea) => `• ${idea.title}`).join("\n")
    : "No treasures chosen yet.";
  const shareData = {
    title: "Alex's Gift of Light",
    text: `My push present shortlist:\n\n${list}`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
    showToast("Shortlist copied to the clipboard.");
  } catch (error) {
    if (error.name !== "AbortError") {
      showToast("Unable to share the shortlist.");
    }
  }
});

render();