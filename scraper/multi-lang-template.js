// Multi-language News Article Template
// Supports AZ, RU, EN with automatic language detection

const translations = {
    backToNews: {
        en: 'Back to News',
        az: 'Xəbərlərə qayıt',
        ru: 'Назад к новостям'
    },
    source: {
        en: 'Article Source & Attribution',
        az: 'Məqalənin Mənbəyi və İstinad',
        ru: 'Источник статьи и атрибуция'
    },
    originallyPublished: {
        en: 'This article was originally published on',
        az: 'Bu məqalə ilk dəfə nəşr olunub',
        ru: 'Эта статья была первоначально опубликована на'
    },
    curatedText: {
        en: 'Plugin.az curates and aggregates renewable energy news from trusted sources to provide comprehensive coverage of Azerbaijan\'s clean energy sector. All credit goes to the original authors and publishers.',
        az: 'Plugin.az Azərbaycanın təmiz enerji sektorunun hərtərəfli əhatəsini təmin etmək üçün etibarlı mənbələrdən bərpa olunan enerji xəbərlərini toplayır və təqdim edir. Bütün kreditlər orijinal müəlliflərə və naşirlərə aiddir.',
        ru: 'Plugin.az собирает и агрегирует новости о возобновляемой энергии из надежных источников для всестороннего освещения сектора чистой энергетики Азербайджана. Все права принадлежат оригинальным авторам и издателям.'
    },
    readOriginal: {
        en: 'Read the original article:',
        az: 'Orijinal məqaləni oxuyun:',
        ru: 'Читать оригинальную статью:'
    },
    relatedArticles: {
        en: 'Related Articles',
        az: 'Əlaqəli Məqalələr',
        ru: 'Связанные статьи'
    },
    noRelated: {
        en: 'No related articles found.',
        az: 'Əlaqəli məqalə tapılmadı.',
        ru: 'Похожие статьи не найдены.'
    },
    recent: {
        en: 'Recent',
        az: 'Son',
        ru: 'Недавно'
    }
};

function generateMultiLangArticle(articleData) {
    return `<!DOCTYPE html>
<html lang="az">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${articleData.ARTICLE_TITLE} | Plugin.az</title>
    <meta name="description" content="${articleData.ARTICLE_EXCERPT}">
    <meta name="keywords" content="${articleData.ARTICLE_KEYWORDS}">
    <meta name="author" content="Plugin.az - renewables.az">
    <meta name="robots" content="index, follow">
    
    <!-- Multi-language support -->
    <link rel="alternate" hreflang="az" href="https://plugin.az/news/${articleData.ARTICLE_SLUG}.html">
    <link rel="alternate" hreflang="en" href="https://plugin.az/news/${articleData.ARTICLE_SLUG}.html">
    <link rel="alternate" hreflang="ru" href="https://plugin.az/news/${articleData.ARTICLE_SLUG}.html">
    <link rel="alternate" hreflang="x-default" href="https://plugin.az/news/${articleData.ARTICLE_SLUG}.html">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://plugin.az/news/${articleData.ARTICLE_SLUG}">
    <meta property="og:title" content="${articleData.ARTICLE_TITLE}">
    <meta property="og:description" content="${articleData.ARTICLE_EXCERPT}">
    <meta property="og:image" content="${articleData.ARTICLE_IMAGE}">
    <meta property="article:published_time" content="${articleData.ARTICLE_DATE_ISO}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${articleData.ARTICLE_TITLE}">
    <meta property="twitter:description" content="${articleData.ARTICLE_EXCERPT}">
    <meta property="twitter:image" content="${articleData.ARTICLE_IMAGE}">
    
    <!-- Canonical -->
    <link rel="canonical" href="https://plugin.az/news/${articleData.ARTICLE_SLUG}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/tablogo.png">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    
    <!-- Translations Script -->
    <script src="/translations.js"></script>
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${articleData.ARTICLE_TITLE}",
        "image": "${articleData.ARTICLE_IMAGE}",
        "datePublished": "${articleData.ARTICLE_DATE_ISO}",
        "author": {
            "@type": "Organization",
            "name": "renewables.az",
            "url": "https://renewables.az"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Plugin.az",
            "logo": {
                "@type": "ImageObject",
                "url": "https://plugin.az/tablogo.png"
            }
        }
    }
    </script>
    
    ${getArticleStyles()}
</head>

<body>
    ${getNavigation()}
    
    <article>
        <a href="/renewable-news.html" class="back-link">
            <span>←</span> <span data-translate="news.backToNews">Back to News</span>
        </a>

        <header class="article-header">
            <span class="category-badge">${articleData.ARTICLE_CATEGORY}</span>
            <h1>${articleData.ARTICLE_TITLE}</h1>
            <div class="article-meta">
                <span class="meta-item">
                    <span>📅</span>
                    <span>${articleData.ARTICLE_DATE}</span>
                </span>
                <span class="meta-item">
                    <span>📰</span>
                    <span>renewables.az</span>
                </span>
            </div>
        </header>

        <img src="${articleData.ARTICLE_IMAGE}" alt="${articleData.ARTICLE_TITLE}" class="featured-image" loading="lazy">

        <div class="content">
            ${articleData.ARTICLE_CONTENT}
        </div>

        <!-- Attribution Section -->
        <div class="attribution-section">
            <h3>📰 <span data-translate="news.sourceAttribution">Article Source & Attribution</span></h3>
            <p>
                <span data-translate="news.originallyPublished">This article was originally published on</span>
                <a href="${articleData.ORIGINAL_LINK}" target="_blank" rel="noopener nofollow" class="source-link">renewables.az</a>
            </p>
            <p data-translate="news.curatedText">
                Plugin.az curates and aggregates renewable energy news from trusted sources to provide comprehensive coverage of Azerbaijan's clean energy sector.
            </p>
            <p>
                <strong data-translate="news.readOriginal">Read the original article:</strong>
                <a href="${articleData.ORIGINAL_LINK}" target="_blank" rel="noopener nofollow" class="source-link">${articleData.ORIGINAL_LINK}</a>
            </p>
        </div>

        <!-- Related Articles -->
        <div class="related-articles">
            <h2 data-translate="news.relatedArticles">Related Articles</h2>
            <div class="related-grid" id="relatedArticles"></div>
        </div>
    </article>

    ${getArticleScripts()}
</body>

</html>`;
}

function getArticleStyles() {
    return `<style>
        :root {
            --az-blue: #6f91a8;
            --az-green: #509E2F;
            --bg-dark: #0a0b0d;
            --card-bg: #161719;
            --text-primary: #ffffff;
            --text-secondary: #a0a0a0;
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }
        body.light-mode {
            --bg-dark: #ffffff;
            --card-bg: #ffffff;
            --text-primary: #1a1a1a;
            --text-secondary: #666666;
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.7;
            transition: all 0.5s ease;
        }
        nav {
            background: transparent;
            backdrop-filter: blur(10px);
            padding: 1rem 0;
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        body.light-mode nav {
            background: rgba(255, 255, 255, 0.9);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo-img { height: 50px; width: auto; }
        .light-mode-logo { display: none !important; }
        .dark-mode-logo { display: block !important; }
        body.light-mode .light-mode-logo { display: block !important; }
        body.light-mode .dark-mode-logo { display: none !important; }
        .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
        }
        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }
        .nav-links a:hover { color: var(--text-primary); }
        article {
            max-width: 900px;
            margin: 0 auto;
            padding: 8rem 2rem 4rem;
        }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-secondary);
            text-decoration: none;
            margin-bottom: 2rem;
        }
        .back-link:hover { color: var(--az-blue); }
        .article-header {
            border-bottom: 2px solid var(--az-blue);
            padding-bottom: 2rem;
            margin-bottom: 3rem;
        }
        .category-badge {
            display: inline-block;
            background: rgba(111, 145, 168, 0.15);
            color: var(--az-blue);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            margin-bottom: 1rem;
        }
        h1 {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2.75rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
        }
        .article-meta {
            display: flex;
            gap: 1.5rem;
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-top: 1rem;
        }
        .featured-image {
            width: 100%;
            max-height: 500px;
            object-fit: cover;
            border-radius: 12px;
            margin: 2rem 0;
            box-shadow: var(--shadow-md);
        }
        .content {
            font-size: 1.1rem;
        }
        .content p {
            margin-bottom: 1.5rem;
            text-align: justify;
        }
        .content h2 {
            font-size: 1.875rem;
            margin: 3rem 0 1.5rem;
        }
        .attribution-section {
            background: var(--card-bg);
            border-left: 4px solid var(--az-blue);
            padding: 1.5rem;
            margin: 3rem 0;
            border-radius: 8px;
            box-shadow: var(--shadow-md);
        }
        .attribution-section h3 {
            color: var(--az-blue);
            margin-bottom: 0.75rem;
        }
        .source-link {
            color: var(--az-blue);
            text-decoration: none;
            border-bottom: 1px solid var(--az-blue);
            transition: all 0.3s;
        }
        .source-link:hover { color: #c68661; }
        .related-articles {
            margin-top: 4rem;
            padding-top: 3rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .related-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
        }
        .related-card {
            background: var(--card-bg);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s;
            text-decoration: none;
            color: inherit;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .related-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
        }
        .related-card img {
            width: 100%;
            height: 160px;
            object-fit: cover;
        }
        .related-card-content { padding: 1.25rem; }
        @media (max-width: 768px) {
            h1 { font-size: 2rem; }
            article { padding: 6rem 1.5rem 2rem; }
            .nav-links { display: none; }
            .related-grid { grid-template-columns: 1fr; }
        }
    </style>`;
}

function getNavigation() {
    return `<nav>
        <div class="nav-container">
            <a href="/" class="logo">
                <img src="/pluginlogo.png" alt="Plugin.az" class="logo-img dark-mode-logo">
                <img src="/lightmodeplugin.png" alt="Plugin.az" class="logo-img light-mode-logo">
            </a>
            <div class="nav-links">
                <a href="/" data-translate="nav.home">Home</a>
                <a href="/azerbaijan-rayon-energy-map.html" data-translate="nav.energyMap">Energy Map</a>
                <a href="/solar-calculator.html" data-translate="nav.calculator">Solar Calculator</a>
                <a href="/regulatory-framework.html" data-translate="nav.framework">Regulatory Framework</a>
                <a href="/renewable-news.html" data-translate="nav.news">News</a>
            </div>
        </div>
    </nav>`;
}

function getArticleScripts() {
    return `<script>
        // Theme toggle
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
        }

        // Language support
        const savedLang = localStorage.getItem('language') || 'az';
        document.documentElement.lang = savedLang;

        // Load related articles
        async function loadRelatedArticles() {
            try {
                const response = await fetch('/news-data.json');
                const data = await response.json();
                const currentCategory = '{{CATEGORY}}';
                const related = data.articles
                    .filter(article => article.category === currentCategory)
                    .slice(0, 3);
                
                const container = document.getElementById('relatedArticles');
                if (related.length > 0) {
                    container.innerHTML = related.map(article => {
                        const slug = article.title.toLowerCase()
                            .replace(/[^\\w\\s-]/g, '')
                            .replace(/\\s+/g, '-')
                            .substring(0, 100);
                        return \`
                            <a href="/news/\${slug}.html" class="related-card">
                                \${article.image ? \`<img src="\${article.image}" alt="\${article.title}" loading="lazy">\` : ''}
                                <div class="related-card-content">
                                    <h3>\${article.title}</h3>
                                    <p style="font-size: 0.85rem; color: var(--text-secondary);">
                                        \${article.date || '<span data-translate="news.recent">Recent</span>'} • \${article.category}
                                    </p>
                                </div>
                            </a>
                        \`;
                    }).join('');
                } else {
                    container.innerHTML = '<p style="color: var(--text-secondary);" data-translate="news.noRelated">No related articles found.</p>';
                }
                
                // Update translations after loading
                if (typeof updateTranslations === 'function') {
                    updateTranslations();
                }
            } catch (error) {
                console.error('Error loading related articles:', error);
            }
        }

        loadRelatedArticles();
        
        // Initialize translations
        if (typeof updateTranslations === 'function') {
            updateTranslations();
        }
    </script>`;
}

module.exports = { generateMultiLangArticle, translations };
