(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var button = qs('[data-nav-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      button.classList.toggle('is-open');
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        activate(index);
        play();
      });
    });

    if (slides.length > 1) {
      activate(0);
      play();
    }
  }

  function initSearch() {
    var form = qs('[data-search-form]');
    if (!form) {
      return;
    }

    var input = qs('[data-search-input]', form);
    var category = qs('[data-search-category]', form);
    var year = qs('[data-search-year]', form);
    var cards = qsa('[data-movie-card]');
    var empty = qs('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = !categoryValue || normalize(card.getAttribute('data-category')) === categoryValue;
        var matchedYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var matched = matchedKeyword && matchedCategory && matchedYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });
    apply();
  }

  function initPlayer() {
    var frame = qs('[data-player-frame]');
    var video = qs('[data-player-video]');
    var layer = qs('[data-play-layer]');
    var button = qs('[data-play-button]');

    if (!frame || !video) {
      return;
    }

    var streamUrl = frame.getAttribute('data-stream') || '';
    var prepared = false;

    function prepare() {
      if (prepared || !streamUrl) {
        return;
      }
      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      prepare();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    frame.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      start();
    });

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initSearch();
    initPlayer();
  });
})();
