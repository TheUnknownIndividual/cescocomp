const { Pool } = require('pg');

// Connection pool
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });
  }
  return pool;
}

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

function generateArticlePage(article) {
  const title = escapeHtml(article.title);
  const excerpt = escapeHtml(article.excerpt || '').substring(0, 160);
  const content = article.content || '<p>Ətraflı məlumat üçün orijinal mənbəyə baxın.</p>';
  const image = escapeHtml(article.image || '/solartower.png');
  const source = escapeHtml(article.source || '');
  const date = article.published_at || new Date().toISOString().split('T')[0];
  const link = escapeHtml(article.link || '#');
  
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
    <meta property="og:url" content="https://plugin.az/blog/${generateSlug(article.title)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="CESAREC">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${excerpt}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${title}",
      "description": "${excerpt}",
      "image": "${image}",
      "datePublished": "${date}",
      "author": {
        "@type": "Organization",
        "name": "CESAREC"
      },
      "publisher": {
        "@type": "Organization", 
        "name": "CESAREC",
        "logo": {
          "@type": "ImageObject",
          "url": "https://plugin.az/tablogo.png"
        }
      },
      "mainEntityOfPage": "https://plugin.az/blog/${generateSlug(article.title)}"
    }
    </script>
    
    <link rel="icon" href="/tablogo.png" type="image/png">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/pages.css">
    
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
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <img src="/tablogo.png" alt="Logo" class="logo-img">
                <span class="brand-text">CESAREC</span>
            </div>
            <div class="nav-inner">
                <div class="nav-links">
                    <a href="/" class="nav-link">Ana Səhifə</a>
                    <a href="/projects" class="nav-link">Layihələr</a>
                    <a href="/solar-calculator" class="nav-link">Hesablayıcı</a>
                    <a href="/regulatory-framework" class="nav-link">Çərçivə</a>
                    <a href="/news" class="nav-link active">Xəbərlər</a>
                </div>
                <div class="nav-controls">
                    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
                        <span class="theme-icon">🌙</span>
                    </button>
                </div>
            </div>
        </div>
    </nav>

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

    <script src="/theme.js"></script>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;
  if (!slug) {
    return res.status(400).json({ error: 'Article slug required' });
  }

  try {
    const db = getPool();
    
    // Try to find by slug first (most efficient)
    let result = await db.query(
      'SELECT * FROM articles WHERE slug = $1 LIMIT 1',
      [slug]
    );

    // If not found, try finding by generated slug from title
    if (result.rows.length === 0) {
      result = await db.query(
        'SELECT * FROM articles WHERE link LIKE $1 OR title ILIKE $2 LIMIT 1',
        [`%${slug}%`, `%${slug.replace(/-/g, ' ')}%`]
      );
    }

    // If still not found, try generating slug from all titles
    if (result.rows.length === 0) {
      const allArticles = await db.query('SELECT * FROM articles LIMIT 200');
      const article = allArticles.rows.find(a => generateSlug(a.title) === slug);
      if (article) {
        result.rows = [article];
      }
    }

    if (result.rows.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html><head><title>Məqalə tapılmadı</title></head>
        <body><h1>Məqalə tapılmadı</h1><a href="/news">Xəbərlərə qayıt</a></body></html>
      `);
    }

    const article = result.rows[0];
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