(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      }, { once: true });
    });

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var previous = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function schedule() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 6500);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          schedule();
        });
      });

      if (previous) {
        previous.addEventListener("click", function () {
          show(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          schedule();
        });
      }

      schedule();
    });

    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
      var params = new URLSearchParams(window.location.search);
      var activeFilter = "";

      if (params.get("q")) {
        input.value = params.get("q");
      }

      function applyFilter() {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter") || "").toLowerCase();
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchChip = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden-by-search", !(matchKeyword && matchChip));
        });
      }

      input.addEventListener("input", applyFilter);

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter-chip") || "";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          applyFilter();
        });
      });

      applyFilter();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var source = player.getAttribute("data-source");
      var cover = player.querySelector("[data-play-button]");
      var playButton = player.querySelector("[data-player-play]");
      var muteButton = player.querySelector("[data-player-mute]");
      var fullscreenButton = player.querySelector("[data-player-fullscreen]");
      var status = player.querySelector("[data-player-status]");
      var hls = null;
      var loaded = false;
      var wantsPlay = false;

      if (!video || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function startVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(function () {
            setStatus("");
            player.classList.add("is-playing");
          }).catch(function () {
            setStatus("点击画面继续播放");
          });
        } else {
          player.classList.add("is-playing");
        }
      }

      function loadVideo() {
        if (loaded) {
          return;
        }

        loaded = true;
        setStatus("正在加载...");

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
            if (wantsPlay) {
              startVideo();
            }
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("网络连接异常，正在重试");
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("媒体加载异常，正在恢复");
              hls.recoverMediaError();
            } else {
              setStatus("视频暂时无法播放");
            }
          });
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("");
            if (wantsPlay) {
              startVideo();
            }
          }, { once: true });
          return;
        }

        setStatus("视频暂时无法播放");
      }

      function requestPlay() {
        wantsPlay = true;
        if (!loaded) {
          loadVideo();
        }
        startVideo();
      }

      function togglePlay() {
        if (video.paused) {
          requestPlay();
        } else {
          video.pause();
        }
      }

      if (cover) {
        cover.addEventListener("click", function (event) {
          event.preventDefault();
          requestPlay();
        });
      }

      if (playButton) {
        playButton.addEventListener("click", function (event) {
          event.preventDefault();
          togglePlay();
        });
      }

      video.addEventListener("click", togglePlay);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        if (playButton) {
          playButton.textContent = "暂停";
        }
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
        if (playButton) {
          playButton.textContent = "播放";
        }
      });

      if (muteButton) {
        muteButton.addEventListener("click", function (event) {
          event.preventDefault();
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function (event) {
          event.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
