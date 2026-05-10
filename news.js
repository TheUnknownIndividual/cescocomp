(function () {
    'use strict';

    var PAGE_SIZE = 6;
    var FALLBACK_IMG = 'solartower.png';

    // DB API — Vercel serverless function proxies to PostgreSQL directly
    var API_BASE  = (window.SITE_CONFIG && window.SITE_CONFIG.newsApiBase) || '/api';
    var CACHE_KEY = 'cescocomp_news_cache';
    var CACHE_TTL = 10 * 60 * 1000; // 10 minutes — refresh silently after this

    var allArticles = [];
    var filteredArticles = [];
    var currentPage = 0;
    var activeSource = 'all';

    var grid = document.getElementById('news-grid');
    var loading = document.getElementById('news-loading');
    var loadMoreBtn = document.getElementById('load-more-btn');
    var filterBar = document.getElementById('news-filter-bar');

    function currentLang() {
        if (window.getLanguage) return window.getLanguage();
        try { return localStorage.getItem('az-energy-lang') || 'en'; } catch (e) { return 'en'; }
    }

    /* ─── Date parsing ──────────────────────────────────────────────── */

    function parseDate(str) {
        if (!str) return new Date(0);
        // "DD.MM.YYYY HH:MM" or "DD.MM.YYYY"
        var m = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
        var d = new Date(str);
        return isNaN(d) ? new Date(0) : d;
    }

    function formatDate(str) {
        var d = parseDate(str);
        if (!d || d.getTime() === 0) return str || '';
        return d.toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    /* ─── Card builder ──────────────────────────────────────────────── */

    function generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ş/g, 's')
            .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
            .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            .substring(0, 100);
    }

    function buildCard(art) {
        var article = document.createElement('article');
        article.className = 'news-card';

        var imgSrc = art.image || FALLBACK_IMG;
        var excerpt = truncateExcerpt(art.excerpt || '');
        var dateStr = formatDate(art.date);
        var blogSlug = generateSlug(art.title);
        var link = art.type === 'cms' && art.slug ? '/' + (art.lang || currentLang()) + '/blog/' + art.slug : '/blog/' + blogSlug;
        var source = art.source || '';

        article.innerHTML =
            '<div class="news-card-img-wrap">' +
                '<img class="news-card-img" src="' + escHtml(imgSrc) + '" alt="' + escHtml(art.image_alt || art.title) + '" loading="lazy">' +
            '</div>' +
            '<div class="news-card-body">' +
                (source ? '<span class="news-source-badge">' + escHtml(source) + '</span>' : '') +
                '<div class="news-date">' + escHtml(dateStr) + '</div>' +
                '<h3>' + escHtml(art.title) + '</h3>' +
                (excerpt ? '<p>' + escHtml(excerpt) + '</p>' : '') +
                '<a class="read-more" href="' + escHtml(link) + '" rel="noopener">Ətraflı oxu →</a>' +
            '</div>';

        // Fallback image on error
        var img = article.querySelector('.news-card-img');
        img.addEventListener('error', function () {
            if (this.src !== location.origin + '/' + FALLBACK_IMG) {
                this.src = FALLBACK_IMG;
            }
        });

        return article;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* Truncate excerpt to at most 3 sentences, or 200 chars, whichever is shorter */
    function truncateExcerpt(text, maxSentences, maxChars) {
        if (!text) return '';
        maxSentences = maxSentences || 3;
        maxChars     = maxChars     || 200;

        // Split on sentence-ending punctuation followed by whitespace or end-of-string
        var sentenceRe = /[^.!?]*[.!?]+(\s|$)/g;
        var sentences = [];
        var match;
        while ((match = sentenceRe.exec(text)) !== null) {
            sentences.push(match[0]);
        }

        var truncated;
        if (sentences.length > maxSentences) {
            truncated = sentences.slice(0, maxSentences).join('').trim();
        } else {
            truncated = text.trim();
        }

        if (truncated.length > maxChars) {
            truncated = truncated.slice(0, maxChars).replace(/\s+\S*$/, '');
        }

        return truncated.length < text.trim().length ? truncated + '...' : truncated;
    }

    /* ─── Render ────────────────────────────────────────────────────── */

    function renderPage() {
        var start = currentPage * PAGE_SIZE;
        var slice = filteredArticles.slice(start, start + PAGE_SIZE);

        if (currentPage === 0) {
            grid.innerHTML = '';
        }

        if (slice.length === 0 && currentPage === 0) {
            var empty = document.createElement('p');
            empty.className = 'news-empty-state';
            empty.textContent = 'Bu mənbədən xəbər tapılmadı.';
            grid.appendChild(empty);
        } else {
            var frag = document.createDocumentFragment();
            slice.forEach(function (art) { frag.appendChild(buildCard(art)); });
            grid.appendChild(frag);
        }

        currentPage++;
        var hasMore = currentPage * PAGE_SIZE < filteredArticles.length;
        loadMoreBtn.style.display = hasMore ? 'inline-block' : 'none';
    }

    /* ─── Filter ────────────────────────────────────────────────────── */

    function applyFilter(source) {
        activeSource = source;
        currentPage = 0;
        filteredArticles = source === 'all'
            ? allArticles
            : allArticles.filter(function (a) { return a.source === source; });
        
        // Sort filtered articles by date (newest first)
        filteredArticles.sort(function(a, b) {
            return (b._ts || 0) - (a._ts || 0);
        });
        
        renderPage();
    }

    filterBar.addEventListener('click', function (e) {
        var btn = e.target.closest('.news-filter-btn');
        if (!btn) return;
        filterBar.querySelectorAll('.news-filter-btn').forEach(function (b) {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        applyFilter(btn.dataset.source);
    });

    loadMoreBtn.addEventListener('click', function () {
        renderPage();
    });

    /* ─── DB API fetch ──────────────────────────────────────────────── */

    function fetchFromAPI(page, pageSize, source) {
        var url = API_BASE + '/news?lang=' + encodeURIComponent(currentLang()) + '&page=' + page + '&pageSize=' + pageSize +
                  (source && source !== 'all' ? '&source=' + encodeURIComponent(source) : '');
        return fetch(url).then(function (r) {
            if (!r.ok) throw new Error('API error ' + r.status);
            return r.json();
        });
    }

    /* ─── localStorage cache ────────────────────────────────────────── */

    function loadCache() {
        try {
            var raw = localStorage.getItem(CACHE_KEY + '_' + currentLang());
            if (!raw) return null;
            var obj = JSON.parse(raw);
            return obj;
        } catch (e) { return null; }
    }

    function saveCache(articles) {
        try {
            localStorage.setItem(CACHE_KEY + '_' + currentLang(), JSON.stringify({
                articles: articles,
                ts: Date.now()
            }));
        } catch (e) {}
    }

    function isCacheStale(cache) {
        return !cache || (Date.now() - (cache.ts || 0)) > CACHE_TTL;
    }

    /* ─── Bootstrap ─────────────────────────────────────────────────── */

    function showGrid() {
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }

    function populateArticles(articles) {
        allArticles = articles.map(function (a) {
            return {
                title:   a.title   || '',
                date:    a.published_at || a.date || '',
                image:   a.image   || '',
                image_alt: a.image_alt || a.title || '',
                excerpt: a.excerpt || '',
                link:    a.link    || '#',
                source:  a.source  || '',
                type:    a.type    || 'scraped',
                slug:    a.slug    || '',
                lang:    a.lang    || currentLang(),
                _ts:     parseDate(a.published_at || a.date).getTime()
            };
        });
        
        // Sort by date (newest first)
        allArticles.sort(function(a, b) {
            return (b._ts || 0) - (a._ts || 0);
        });
        
        filteredArticles = activeSource === 'all'
            ? allArticles
            : allArticles.filter(function (a) { return a.source === activeSource; });
        currentPage = 0;
        showGrid();
        renderPage();
    }

    function init() {
        // 1. Render from cache immediately (zero-wait display)
        var cache = loadCache();
        if (cache && cache.articles && cache.articles.length > 0) {
            populateArticles(cache.articles);
        }

        // 2. Fetch fresh data from DB API (always, to keep content current)
        fetchFromAPI(1, 200, 'all')
            .then(function (data) {
                var articles = data.articles || [];
                if (articles.length === 0) return fetchStaticFallback(cache);
                saveCache(articles);
                // Only re-render if we got different data than cache
                var cacheLen = (cache && cache.articles) ? cache.articles.length : 0;
                if (articles.length !== cacheLen || isCacheStale(cache)) {
                    populateArticles(articles);
                }
            })
            .catch(function (err) {
                console.warn('[news] API fetch failed:', err.message);
                // If no cache was available either, show empty state
                if (!cache || !cache.articles || cache.articles.length === 0) {
                    fetchStaticFallback(cache).catch(function () {
                        showGrid();
                        renderPage();
                    });
                }
            });
    }

    function fetchStaticFallback(cache) {
        return fetch('cecso-news.json')
            .then(function (r) {
                if (!r.ok) throw new Error('fallback ' + r.status);
                return r.json();
            })
            .then(function (data) {
                var articles = data.articles || [];
                if (articles.length === 0) return;
                saveCache(articles);
                var cacheLen = (cache && cache.articles) ? cache.articles.length : 0;
                if (articles.length !== cacheLen || isCacheStale(cache)) {
                    populateArticles(articles);
                }
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('langchange', function () {
        currentPage = 0;
        allArticles = [];
        filteredArticles = [];
        init();
    });
})();
