(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      menu.classList.toggle("open");
    });
  }

  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  const activeFilters = new Map();

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    const queryInput = document.querySelector("[data-search-input]");
    const query = normalize(queryInput ? queryInput.value : "");
    cards.forEach((card) => {
      const searchText = normalize(card.dataset.searchText || card.textContent);
      let visible = !query || searchText.includes(query);
      activeFilters.forEach((value, key) => {
        if (value && value !== "all" && normalize(card.dataset[key]) !== normalize(value)) {
          visible = false;
        }
      });
      card.classList.toggle("is-hidden", !visible);
    });
  }

  document.querySelectorAll("[data-search-input]").forEach((input) => {
    input.addEventListener("input", applyFilters);
  });

  document.querySelectorAll("[data-filter-key][data-filter-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.filterKey;
      const value = button.dataset.filterValue;
      activeFilters.set(key, value);
      document.querySelectorAll(`[data-filter-key="${key}"]`).forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      applyFilters();
    });
  });

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => show(current + 1), 5600);
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(current + 1);
        restart();
      });
    }

    restart();
  }
})();
