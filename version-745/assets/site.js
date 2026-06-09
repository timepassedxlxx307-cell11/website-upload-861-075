(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function runHeader() {
    var toggle = qs(".mobile-toggle");
    var panel = qs(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var opened = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    qsa("form[action='./search.html']").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs("input[name='q']", form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function runHero() {
    var slides = qsa(".hero-slide");
    var dots = qsa(".hero-dot");
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function reset(nextIndex) {
      window.clearInterval(timer);
      show(nextIndex);
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        reset(dotIndex);
      });
    });

    var prev = qs(".hero-arrow.prev");
    var next = qs(".hero-arrow.next");
    if (prev) {
      prev.addEventListener("click", function () {
        reset(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        reset(index + 1);
      });
    }

    show(0);
    start();
  }

  function runCardFilter() {
    qsa("[data-card-filter]").forEach(function (input) {
      var target = input.getAttribute("data-card-filter");
      var grid = qs(target);
      if (!grid) {
        return;
      }
      var cards = qsa(".movie-card", grid);
      input.addEventListener("input", function () {
        var keyword = normalizeText(input.value);
        cards.forEach(function (card) {
          var haystack = normalizeText([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" "));
          card.classList.toggle("hidden-card", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  }

  function runSearchPage() {
    var root = qs("#search-results");
    var input = qs("#search-input");
    if (!root || !input || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function card(movie) {
      return [
        '<article class="movie-card card card-hover">',
        '<a class="poster-link" href="' + movie.url + '" aria-label="观看' + movie.title + '">',
        '<div class="poster-wrap">',
        '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="poster-play">▶</span>',
        '<span class="poster-year">' + movie.year + '</span>',
        '<span class="poster-region">' + movie.region + '</span>',
        '</div>',
        '</a>',
        '<div class="movie-info">',
        '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
        '<p class="movie-meta">' + movie.category + ' · ' + movie.type + ' · ' + movie.genre + '</p>',
        '<p class="movie-one-line">' + movie.oneLine + '</p>',
        '</div>',
        '</article>'
      ].join("");
    }

    function render() {
      var keyword = normalizeText(input.value);
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalizeText([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.year,
          movie.category,
          movie.oneLine
        ].join(" "));
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (!results.length) {
        root.innerHTML = '<div class="card search-results-empty">没有找到匹配影片</div>';
        return;
      }
      root.innerHTML = results.map(card).join("");
    }

    input.addEventListener("input", render);
    var searchForm = qs("#search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }
    render();
  }

  window.setupMoviePlayer = function (source) {
    var video = qs("#movie-player");
    var overlay = qs("#player-overlay");
    var button = qs("#play-button");
    var attached = false;

    if (!video || !overlay || !button || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      overlay.classList.add("is-hidden");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    runHeader();
    runHero();
    runCardFilter();
    runSearchPage();
  });
})();
