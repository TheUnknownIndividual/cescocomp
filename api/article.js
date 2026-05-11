const { getPool } = require('../lib/db');
const { findScrapedArticleBySlug } = require('../lib/articles');
const {
  BASE_URL,
  DEFAULT_KEYWORDS,
  escapeHtml: cmsEscapeHtml,
  findCmsPostBySlug,
  normalizeLang
} = require('../lib/cms');

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    .substring(0, 100);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function renderThemeToggle() {
  return `
        <div class="theme-toggle-wrap">
          <button type="button" id="theme-toggle-btn" class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode" aria-pressed="false">
            <span class="theme-icon-sun" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
            <span class="theme-icon-moon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.4 15.3A8.5 8.5 0 0 1 8.7 3.6a8.5 8.5 0 1 0 11.7 11.7Z" fill="currentColor"/></svg></span>
          </button>
        </div>`;
}

function renderSiteNav() {
  return `
    <nav class="navbar">
      <div class="nav-inner">
        <a href="/" class="logo">
          <img src="/lightmodeplugin.png" alt="AZ Energy Hub" class="logo-img">
        </a>
        <ul class="nav-links">
          <li><a href="/" data-i18n="nav.home">Home</a></li>
          <li><a href="/solar-calculator" data-i18n="nav.calculator">Solar Calculator</a></li>
          <li><a href="/regulatory-framework" data-i18n="nav.framework">Framework</a></li>
          <li><a href="/projects" data-i18n="nav.projects">Projects</a></li>
          <li><a href="/news" data-i18n="nav.news">News</a></li>
        </ul>
        <div class="nav-right">
          <div class="lang-switcher" id="lang-switcher">
            <button type="button" class="lang-switcher-btn" id="lang-switcher-btn" aria-label="Change language">
              <span id="currentLang">EN</span>
            </button>
          </div>
          ${renderThemeToggle()}
          <button type="button" class="nav-burger" id="nav-burger" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>`;
}

function renderCmsLanguageRedirectScript(lang, translations) {
  const urls = {};
  (translations || []).forEach(translation => {
    if (translation && translation.lang && translation.slug) {
      urls[translation.lang] = `/${translation.lang}/blog/${translation.slug}`;
    }
  });
  return `
    <script>
      window.BLOG_PAGE_LANG = ${jsonLd(lang)};
      window.BLOG_TRANSLATION_URLS = ${jsonLd(urls)};
      try { localStorage.setItem('az-energy-lang', window.BLOG_PAGE_LANG); } catch (e) {}
    </script>
    <script src="/i18n.js"></script>
    <script>
      (function () {
        function cleanPath(path) { return String(path || '').replace(/\\/$/, '') || '/'; }
        window.addEventListener('langchange', function (event) {
          var lang = (event.detail && event.detail.lang) || (window.getLanguage && window.getLanguage());
          var target = window.BLOG_TRANSLATION_URLS && window.BLOG_TRANSLATION_URLS[lang];
          if (target && cleanPath(target) !== cleanPath(window.location.pathname)) {
            window.location.href = target;
          }
        });
      })();
    </script>`;
}

function generateCmsArticlePage(post) {
  const lang = normalizeLang(post.lang);
  const targetLocation = String(post.target_location || '').trim();
  const effectiveSeoTitle = post.local_seo_title || (targetLocation && post.seo_title ? `${post.seo_title} - ${targetLocation}` : post.seo_title) || post.title;
  const effectiveDescription = post.local_seo_description || post.seo_description || post.excerpt || '';
  const title = escapeHtml(effectiveSeoTitle);
  const displayTitle = escapeHtml(post.title);
  const excerpt = escapeHtml(effectiveDescription).substring(0, 170);
  const locationKeywords = targetLocation ? `, ${targetLocation}` : '';
  const keywords = escapeHtml(`${post.seo_keywords || DEFAULT_KEYWORDS[lang]}${locationKeywords}`);
  const image = escapeHtml(post.hero_image || '/solartower.png');
  const imageAlt = escapeHtml(post.image_alt || post.title);
  const canonical = `${BASE_URL}/${lang}/blog/${post.slug}`;
  const published = post.published_at || new Date().toISOString();
  const modified = post.updated_at || published;
  const hreflangs = (post.translations || []).map(t => {
    const href = `${BASE_URL}/${t.lang}/blog/${t.slug}`;
    return `<link rel="alternate" hreflang="${escapeHtml(t.lang)}" href="${escapeHtml(href)}">`;
  }).join('\n    ');
  const fallback = (post.translations || []).find(t => t.lang === 'az') || (post.translations || [])[0];
  const xDefault = fallback ? `<link rel="alternate" hreflang="x-default" href="${escapeHtml(`${BASE_URL}/${fallback.lang}/blog/${fallback.slug}`)}">` : '';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: effectiveSeoTitle,
    description: effectiveDescription,
    image: post.hero_image || `${BASE_URL}/solartower.png`,
    datePublished: published,
    dateModified: modified,
    inLanguage: lang,
    keywords: `${post.seo_keywords || DEFAULT_KEYWORDS[lang]}${locationKeywords}`,
    spatialCoverage: targetLocation ? { '@type': 'Place', name: targetLocation } : undefined,
    areaServed: targetLocation ? { '@type': 'Place', name: targetLocation } : undefined,
    author: { '@type': 'Organization', name: 'CESAREC' },
    publisher: {
      '@type': 'Organization',
      name: 'CESAREC',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/tablogo.png` }
    },
    mainEntityOfPage: canonical
  };

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | CESAREC</title>
    <meta name="description" content="${excerpt}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="CESAREC">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${excerpt}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="CESAREC">
    <meta property="og:locale" content="${lang === 'az' ? 'az_AZ' : lang === 'ru' ? 'ru_RU' : 'en_US'}">
    ${(post.translations || []).filter(t => t.lang !== lang).map(t => `<meta property="og:locale:alternate" content="${t.lang === 'az' ? 'az_AZ' : t.lang === 'ru' ? 'ru_RU' : 'en_US'}">`).join('\n    ')}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${excerpt}">
    <meta name="twitter:image" content="${image}">
    <script type="application/ld+json">${jsonLd(structuredData)}</script>
    <link rel="canonical" href="${escapeHtml(canonical)}">
    ${hreflangs}
    ${xDefault}
    <link rel="icon" href="/tablogo.png" type="image/png">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/pages.css">
    <script src="/site-config.js"></script>
    <script src="/analytics.js" defer></script>
    <style>
      .article-container{max-width:840px;margin:2rem auto;padding:2rem;background:var(--card-bg);border-radius:12px;box-shadow:var(--shadow)}
      .article-image{width:100%;max-height:430px;object-fit:cover;border-radius:8px;margin:1rem 0 1.5rem}
      .article-meta{display:flex;gap:1rem;color:var(--text-muted);margin:.5rem 0 1rem}
      .article-content{line-height:1.75;font-size:1.08rem}
      .article-content h1{font-size:2rem;line-height:1.2;margin:2rem 0 1rem}
      .article-content h2{font-size:1.55rem;line-height:1.25;margin:1.8rem 0 .8rem}
      .article-content h3{font-size:1.25rem;line-height:1.3;margin:1.4rem 0 .65rem}
      .article-content img{max-width:100%;height:auto;border-radius:8px;margin:1rem 0}
      .article-content blockquote{border-left:4px solid var(--primary-color);margin:1rem 0;padding:.5rem 1rem;background:rgba(0,0,0,.04)}
      .md-table-wrap{width:100%;overflow-x:auto;margin:1.25rem 0}
      .md-table{width:100%;border-collapse:collapse;min-width:520px}
      .md-table th,.md-table td{border:1px solid rgba(120,130,120,.28);padding:.75rem;text-align:left;vertical-align:top}
      .md-table th{background:rgba(46,125,50,.08);font-weight:800}
      .back-to-news{display:inline-flex;margin-bottom:1.25rem;color:var(--primary-color);text-decoration:none;font-weight:700}
    </style>
</head>
<body>
    ${renderSiteNav()}
    <main class="main-content">
      <div class="container">
        <a href="/news" class="back-to-news">← News</a>
        <article class="article-container">
          <header>
            <h1>${displayTitle}</h1>
            <div class="article-meta"><span>${escapeHtml(new Date(published).toLocaleDateString(lang === 'az' ? 'az-AZ' : lang))}</span><span>Blog</span></div>
            ${post.hero_image ? `<img src="${image}" alt="${imageAlt}" class="article-image" loading="eager">` : ''}
          </header>
          <div class="article-content">${post.html || `<p>${cmsEscapeHtml(post.excerpt || '')}</p>`}</div>
        </article>
      </div>
    </main>
    <footer class="footer"><div class="footer-content"><p>&copy; 2026 CESAREC. Bütün hüquqlar qorunur.</p></div></footer>
    ${renderCmsLanguageRedirectScript(lang, post.translations || [])}
    <script src="/theme.js"></script>
</body>
</html>`;
}

function generateArticlePage(article) {
  const title = escapeHtml(article.title);
  const excerpt = escapeHtml(article.excerpt || '').substring(0, 160);
  const content = article.content || '<p>Ətraflı məlumat üçün orijinal mənbəyə baxın.</p>';
  const image = escapeHtml(article.image || '/solartower.png');
  const source = escapeHtml(article.source || '');
  const date = article.published_at || article.date || new Date().toISOString().split('T')[0];
  const link = escapeHtml(article.link || '#');
  const articleSlug = article.slug || generateSlug(article.title);
  const canonical = `${BASE_URL}/blog/${articleSlug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || '',
    image: article.image || `${BASE_URL}/solartower.png`,
    datePublished: date,
    author: { '@type': 'Organization', name: 'CESAREC' },
    publisher: {
      '@type': 'Organization',
      name: 'CESAREC',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/tablogo.png` }
    },
    mainEntityOfPage: canonical
  };
  
  return `<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | CESAREC - Azerbaijan Sustainable Energies</title>
    <meta name="description" content="${excerpt}">
    <meta name="keywords" content="bərpa olunan enerji, günəş enerjisi, külək enerjisi, Azərbaycan, sustainable energy">
    <meta name="author" content="CESAREC">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${excerpt}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="CESAREC">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${excerpt}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">${jsonLd(structuredData)}</script>
    
    <link rel="icon" href="/tablogo.png" type="image/png">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/pages.css">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <script src="/site-config.js"></script>
    <script src="/analytics.js" defer></script>
    
    <style>
    .article-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background: var(--card-bg);
        border-radius: 12px;
        margin-top: 2rem;
        margin-bottom: 2rem;
        box-shadow: var(--shadow);
    }
    .article-header {
        margin-bottom: 2rem;
    }
    .article-image {
        width: 100%;
        max-height: 400px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    .article-meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: var(--text-muted);
    }
    .source-badge {
        background: var(--accent);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    .article-content {
        line-height: 1.7;
        font-size: 1.1rem;
    }
    .article-content p {
        margin-bottom: 1.5rem;
    }
    .article-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 1rem 0;
    }
    .back-to-news {
        display: inline-flex;
        align-items: center;
        color: var(--accent);
        text-decoration: none;
        margin-bottom: 2rem;
        font-weight: 500;
    }
    .back-to-news:hover {
        text-decoration: underline;
    }
    .source-attribution {
        background: var(--bg-secondary);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 2rem;
        text-align: center;
    }
    </style>
</head>
<body>
    ${renderSiteNav()}

    <main class="main-content">
        <div class="container">
            <a href="/news" class="back-to-news">← Xəbərlərə qayıt</a>
            
            <article class="article-container">
                <header class="article-header">
                    <h1>${title}</h1>
                    <div class="article-meta">
                        <span>${date}</span>
                        ${source ? `<span class="source-badge">${source}</span>` : ''}
                    </div>
                    ${image !== '/solartower.png' ? `<img src="${image}" alt="${title}" class="article-image" loading="lazy">` : ''}
                </header>
                
                <div class="article-content">
                    ${content}
                </div>
                
                ${link !== '#' ? `
                <div class="source-attribution">
                    <p><strong>Mənbə:</strong> <a href="${link}" target="_blank" rel="nofollow noopener">${source}</a></p>
                    <p><small>Bu məqalə orijinal mənbədən izin ilə paylaşılmışdır.</small></p>
                </div>
                ` : ''}
            </article>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2026 CESAREC. Bütün hüquqlar qorunur.</p>
        </div>
    </footer>

    <script src="/i18n.js"></script>
    <script src="/theme.js"></script>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;
  const lang = normalizeLang(req.query.lang);
  if (!slug) {
    return res.status(400).json({ error: 'Article slug required' });
  }

  try {
    let cmsPost = null;
    try {
      cmsPost = await findCmsPostBySlug({ lang, slug });
    } catch (error) {
      console.error('[api/article] CMS lookup failed:', error.message);
    }
    if (cmsPost) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(generateCmsArticlePage(cmsPost));
    }

    const article = await findScrapedArticleBySlug(slug, { db: getPool() });
    if (!article) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html><head><title>Məqalə tapılmadı</title></head>
        <body><h1>Məqalə tapılmadı</h1><a href="/news">Xəbərlərə qayıt</a></body></html>
      `);
    }

    const html = generateArticlePage(article);
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('[api/article]', error.message);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html><head><title>Xəta</title></head>
      <body><h1>Xəta baş verdi</h1><a href="/news">Xəbərlərə qayıt</a></body></html>
    `);
  }
};
