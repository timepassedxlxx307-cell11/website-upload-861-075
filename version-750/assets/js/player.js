(() => {
  function bindPlayer(frame) {
    const video = frame.querySelector("video");
    const layer = frame.querySelector(".player-poster");
    const button = frame.querySelector(".play-button");
    const src = frame.dataset.url;
    let ready = false;
    let hls = null;

    function prepare() {
      if (!video || !src || ready) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      ready = true;
    }

    function play() {
      prepare();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      const action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(() => {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (layer) {
      layer.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", () => {
        if (!ready) {
          play();
        } else if (video.paused) {
          video.play().catch(() => {});
        }
      });
      video.addEventListener("play", () => {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
      window.addEventListener("pagehide", () => {
        if (hls) {
          hls.destroy();
        }
      });
    }
  }

  document.querySelectorAll("[data-player]").forEach(bindPlayer);
})();
