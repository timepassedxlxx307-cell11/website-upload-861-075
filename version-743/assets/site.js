(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var panelFilter = document.querySelector('[data-filter-panel]');
  var grid = document.querySelector('[data-filter-grid]');

  if (panelFilter && grid) {
    var keyword = panelFilter.querySelector('[data-filter-input]');
    var year = panelFilter.querySelector('[data-filter-year]');
    var region = panelFilter.querySelector('[data-filter-region]');
    var category = panelFilter.querySelector('[data-filter-category]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (keyword && initialKeyword) {
      keyword.value = initialKeyword;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var q = normalize(keyword ? keyword.value : '');
      var y = normalize(year ? year.value : '');
      var r = normalize(region ? region.value : '');
      var c = normalize(category ? category.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }

        if (y && normalize(card.getAttribute('data-year')) !== y) {
          ok = false;
        }

        if (r && normalize(card.getAttribute('data-region')) !== r) {
          ok = false;
        }

        if (c && normalize(card.getAttribute('data-category')) !== c) {
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

    [keyword, year, region, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();

function initMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('.play-overlay');
  var attached = false;
  var hlsInstance = null;

  if (!video || !button || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        maxBufferLength: 45,
        backBufferLength: 30
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    attachSource();
    video.controls = true;
    button.classList.add('is-hidden');

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
