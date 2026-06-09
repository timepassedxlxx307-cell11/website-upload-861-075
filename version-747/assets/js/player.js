import { H as Hls } from "./hls-vendor.js";

document.querySelectorAll("[data-m3u8-player]").forEach(function (wrap) {
  var video = wrap.querySelector("video");
  var startButton = wrap.querySelector("[data-player-start]");
  var source = video ? video.dataset.src : "";
  var initialized = false;
  var hls = null;

  function hideStartButton() {
    if (startButton) {
      startButton.classList.add("is-hidden");
    }
  }

  function playVideo() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function initPlayer() {
    if (!video || !source || initialized) {
      return;
    }

    initialized = true;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
    }
  }

  function start() {
    hideStartButton();
    initPlayer();

    if (initialized) {
      playVideo();
    }
  }

  if (startButton) {
    startButton.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!initialized) {
        start();
      } else if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", hideStartButton);
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
});
