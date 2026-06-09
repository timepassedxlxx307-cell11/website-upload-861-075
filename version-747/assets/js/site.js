(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      }

      function resetTimer() {
        if (timer) {
          window.clearInterval(timer);
        }
        startTimer();
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          resetTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          resetTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          resetTimer();
        });
      }

      startTimer();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var grid = document.querySelector("[data-filterable-grid]");
      var emptyState = document.querySelector("[data-empty-state]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || params.get("keyword") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function filterCards() {
        var query = normalize(input ? input.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category
          ].join(" "));
          var typeValue = normalize(card.dataset.type);
          var regionValue = normalize(card.dataset.region);
          var queryMatched = !query || haystack.indexOf(query) !== -1;
          var typeMatched = !type || typeValue.indexOf(type) !== -1;
          var regionMatched = !region || regionValue.indexOf(region) !== -1;
          var visible = queryMatched && typeMatched && regionMatched;

          card.style.display = visible ? "" : "none";

          if (visible) {
            visibleCount += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [input, typeSelect, regionSelect].forEach(function (field) {
        if (field) {
          field.addEventListener("input", filterCards);
          field.addEventListener("change", filterCards);
        }
      });

      filterCards();
    });
  });
})();
