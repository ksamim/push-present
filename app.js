const ideas = [
  {
    id: "birthstone-ring",
    type: "jewelry",
    title: "Birthstone Ring",
    note: "A simple band set with the baby's birthstone.",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "initial-necklace",
    type: "jewelry",
    title: "Initial Necklace",
    note: "A delicate everyday piece with a tiny initial charm.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "keepsake-box",
    type: "keepsake",
    title: "Keepsake Box",
    note: "A beautiful place for hospital bands, notes, and first memories.",
    image:
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=85",
  },
];

const savedKey = "push-present-saved-ideas";
const savedIdeas = new Set(JSON.parse(localStorage.getItem(savedKey) || "[]"));
const grid = document.querySelector("#idea-grid");
const resultsLabel = document.querySelector("#results-label");
const filters = document.querySelectorAll(".filter");
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
    filteredIdeas.length === 1 ? "idea" : "ideas"
  }`;

  if (filteredIdeas.length === 0) {
    grid.innerHTML = '<p class="empty-state">Nothing saved yet. Find an idea you love.</p>';
    return;
  }

  grid.innerHTML = filteredIdeas
    .map(
      (idea) => `
        <article class="idea-card">
          <img src="${idea.image}" alt="${idea.title}" />
          <div class="idea-body">
            <div class="idea-meta">
              <div>
                <p class="idea-type">${idea.type}</p>
                <h2>${idea.title}</h2>
              </div>
              <button
                class="save-button"
                type="button"
                data-idea-id="${idea.id}"
                aria-pressed="${savedIdeas.has(idea.id)}"
              >${savedIdeas.has(idea.id) ? "Saved" : "Save"}</button>
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

render();