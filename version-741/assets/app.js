(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function bindMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function bindHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var copies = Array.prototype.slice.call(document.querySelectorAll(".hero-copy-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var previous = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            copies.forEach(function (copy, current) {
                copy.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
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
        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                start();
            });
        });
        start();
    }

    function bindFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var keyword = document.getElementById("filter-keyword");
        var type = document.getElementById("filter-type");
        var year = document.getElementById("filter-year");
        var empty = document.getElementById("filter-empty");
        if (!cards.length || !keyword) {
            return;
        }

        function apply() {
            var query = keyword.value.trim().toLowerCase();
            var typeValue = type ? type.value : "";
            var yearValue = year ? year.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region")
                ].join(" ").toLowerCase();
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchType = !typeValue || haystack.indexOf(typeValue.toLowerCase()) !== -1;
                var matchYear = !yearValue || haystack.indexOf(yearValue.toLowerCase()) !== -1;
                var show = matchQuery && matchType && matchYear;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        keyword.addEventListener("input", apply);
        if (type) {
            type.addEventListener("change", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"movie-poster\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看 " + escapeHtml(item.title) + "\">" +
                    "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
                    "<span class=\"score-badge\">" + escapeHtml(item.score) + "</span>" +
                    "<span class=\"play-badge\">▶</span>" +
                "</a>" +
                "<div class=\"movie-info\">" +
                    "<div class=\"movie-meta-line\">" +
                        "<span>" + escapeHtml(item.year) + "</span>" +
                        "<span>" + escapeHtml(item.region) + "</span>" +
                        "<span>" + escapeHtml(item.type) + "</span>" +
                    "</div>" +
                    "<h2><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>" +
                    "<p class=\"movie-card-summary\">" + escapeHtml(item.oneLine) + "</p>" +
                    "<div class=\"tag-list\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function bindSearchPage() {
        var input = document.getElementById("search-page-input");
        var list = document.getElementById("search-results");
        var title = document.getElementById("search-results-title");
        if (!input || !list || !Array.isArray(window.searchEntries)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function render(value) {
            var q = value.trim().toLowerCase();
            var items = window.searchEntries;
            if (q) {
                items = items.filter(function (item) {
                    return [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(" ")].join(" ").toLowerCase().indexOf(q) !== -1;
                });
                title.textContent = items.length ? "搜索结果" : "没有找到匹配影片";
            } else {
                items = items.slice(0, 24);
                title.textContent = "热门推荐";
            }
            list.innerHTML = items.slice(0, 120).map(renderCard).join("");
        }

        render(query);
        input.addEventListener("input", function () {
            render(input.value);
        });
    }

    ready(function () {
        bindMobileMenu();
        bindHero();
        bindFilters();
        bindSearchPage();
    });
}());

function setupMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    if (!video || !cover || !source) {
        return;
    }
    var ready = false;
    var hlsInstance = null;

    function startPlayback() {
        if (!ready) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {});
                }, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = source;
                video.play().catch(function () {});
            }
            ready = true;
        } else {
            video.play().catch(function () {});
        }
        cover.classList.add("is-hidden");
    }

    cover.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (!ready || video.paused) {
            startPlayback();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
