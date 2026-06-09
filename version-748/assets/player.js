(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initPlayer(root) {
        var video = root.querySelector("video[data-src]");
        var playButton = root.querySelector("[data-play]");
        if (!video || !playButton) {
            return;
        }
        var source = video.getAttribute("data-src");
        var hls = null;

        function loadSource() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.setAttribute("data-ready", "1");
        }

        function start() {
            loadSource();
            playButton.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    playButton.classList.remove("is-hidden");
                });
            }
        }

        playButton.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "1") {
                start();
            }
        });
        video.addEventListener("playing", function () {
            playButton.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.currentTime) {
                playButton.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
    });
}());
