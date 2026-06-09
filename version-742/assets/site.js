(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('is-open');
            navMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

    filterInputs.forEach(function (input) {
        var section = input.closest('.content-section') || document;
        var grid = section.querySelector('[data-filter-grid]');
        var yearSelect = section.querySelector('[data-filter-year]');
        var resetButton = section.querySelector('[data-filter-reset]');

        if (!grid) {
            return;
        }

        var items = Array.prototype.slice.call(grid.children);

        var applyFilter = function () {
            var keyword = input.value.trim().toLowerCase();
            var year = yearSelect ? yearSelect.value : '';

            items.forEach(function (item) {
                var text = [
                    item.getAttribute('data-title') || '',
                    item.getAttribute('data-region') || '',
                    item.getAttribute('data-genre') || '',
                    item.textContent || ''
                ].join(' ').toLowerCase();
                var itemYear = item.getAttribute('data-year') || '';
                var matchedKeyword = keyword === '' || text.indexOf(keyword) !== -1;
                var matchedYear = year === '' || itemYear === year;
                item.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
            });
        };

        input.addEventListener('input', applyFilter);
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                input.value = '';
                if (yearSelect) {
                    yearSelect.value = '';
                }
                applyFilter();
            });
        }
    });

    var playerBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    playerBoxes.forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.player-overlay');
        var streamUrl = box.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        var begin = function () {
            button.classList.add('is-hidden');

            if (!started) {
                started = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = streamUrl;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        };

        button.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
    });

    var results = document.getElementById('searchResults');

    if (results && window.MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get('q') || '').trim().toLowerCase();
        var title = document.querySelector('[data-search-title]');
        var subtitle = document.querySelector('[data-search-subtitle]');
        var list = window.MOVIES.filter(function (movie) {
            if (!keyword) {
                return true;
            }
            return [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, keyword ? 240 : 72);

        var escapeHtml = function (value) {
            return String(value || '').replace(/[&<>'"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[char];
            });
        };

        if (title) {
            title.textContent = keyword ? '搜索结果' : '热门影片';
        }
        if (subtitle) {
            subtitle.textContent = keyword ? '为你找到相关影片' : '精选片库内容，可继续输入关键词查找';
        }

        if (!list.length) {
            results.innerHTML = '<div class="empty-state"><h2>未找到相关影片</h2><p>可以尝试更换影片名称、题材或地区关键词。</p></div>';
            return;
        }

        results.innerHTML = list.map(function (movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card">' +
                '<a href="' + escapeHtml(movie.url) + '" class="movie-card-link">' +
                '<div class="poster-frame">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="type-pill">' + escapeHtml(movie.type) + '</span>' +
                '</div>' +
                '<div class="movie-card-body">' +
                '<h3>' + escapeHtml(movie.title) + '</h3>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.rating) + '</span></div>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</a>' +
                '</article>';
        }).join('');
    }
})();
