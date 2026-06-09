window.MovieApp = (function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-nav]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

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
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5800);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: (params.get("q") || "").trim(),
      year: (params.get("year") || "").trim()
    };
  }

  function textMatches(value, query) {
    return String(value || "").toLowerCase().indexOf(query) !== -1;
  }

  function initFilters() {
    var pages = Array.prototype.slice.call(document.querySelectorAll("[data-filter-page]"));
    pages.forEach(function (page) {
      var input = page.querySelector("[data-filter-search]");
      var type = page.querySelector("[data-filter-type]");
      var region = page.querySelector("[data-filter-region]");
      var year = page.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(page.querySelectorAll(".movie-card"));
      var empty = page.querySelector("[data-filter-empty]");
      var query = readQuery();

      if (page.hasAttribute("data-search-page") && input && query.q) {
        input.value = query.q;
      }
      if (year && query.year) {
        year.value = query.year;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedType = type ? type.value : "";
        var selectedRegion = region ? region.value : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var ok = true;
          if (keyword && !textMatches(haystack, keyword)) {
            ok = false;
          }
          if (selectedType && card.getAttribute("data-type") !== selectedType) {
            ok = false;
          }
          if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
            ok = false;
          }
          if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupMoviePlayer(options) {
    ready(function () {
      var video = document.getElementById(options.id);
      var button = document.getElementById(options.button);
      var message = document.getElementById(options.message);
      var attached = false;
      var hls = null;

      if (!video || !button || !options.url) {
        return;
      }

      if (options.poster) {
        video.setAttribute("poster", options.poster);
      }

      function showMessage(value) {
        if (!message) {
          return;
        }
        message.textContent = value;
        message.hidden = false;
      }

      function attach() {
        if (attached) {
          return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = options.url;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(options.url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("播放暂时无法加载，请稍后再试");
            }
          });
          return Promise.resolve();
        }
        video.src = options.url;
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          button.classList.add("is-hidden");
          video.controls = true;
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              button.classList.remove("is-hidden");
            });
          }
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });

  return {
    setupMoviePlayer: setupMoviePlayer
  };
})();
