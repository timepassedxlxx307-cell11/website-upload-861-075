(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function getQuery() {
        return new URLSearchParams(window.location.search).get("q") || "";
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span class=\"pill\">" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"movie-card-link\" href=\"" + movie.link + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<div class=\"movie-poster\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-year\">" + escapeHtml(movie.year) + "</span><span class=\"poster-type\">" + escapeHtml(movie.type) + "</span></div>" +
            "<div class=\"movie-info\"><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.line) + "</p><div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.category) + "</span></div><div class=\"tag-row\">" + tags + "</div></div>" +
            "</a></article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupSearch() {
        var box = document.getElementById("searchResults");
        if (!box || !window.siteMovies) {
            return;
        }
        var input = document.querySelector(".big-search input[name='q']");
        var title = document.querySelector("[data-search-title]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var query = getQuery().trim();
        var filter = "";
        if (input) {
            input.value = query;
        }

        function render() {
            var q = query.toLowerCase();
            var results = window.siteMovies.filter(function (movie) {
                var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                var matchQuery = !q || text.indexOf(q) !== -1;
                var matchFilter = !filter || movie.category === filter;
                return matchQuery && matchFilter;
            }).slice(0, 120);
            if (title) {
                title.textContent = q || filter ? "搜索结果" : "精选片库";
            }
            box.innerHTML = results.length ? results.map(movieCard).join("") : "<div class=\"empty-state\">没有找到相关影片，请更换关键词。</div>";
            filterButtons.forEach(function (button) {
                button.classList.toggle("active", (button.getAttribute("data-filter") || "") === filter);
            });
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filter = button.getAttribute("data-filter") || "";
                render();
            });
        });
        render();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
}());
