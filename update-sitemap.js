// Generate updated sitemap.xml with news articles
const fs = require('fs');
const path = require('path');

// Read news data
const newsDataPath = path.join(__dirname, 'news-data.json');
const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf-8'));

// Helper function to create URL-friendly slug
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100);
}

// Helper function to format date
function formatDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];

    try {
        const parts = dateStr.split(/[.\-\/]/);
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    } catch (e) {
        console.warn(`Could not parse date: ${dateStr}`);
    }

    return new Date().toISOString().split('T')[0];
}

// Generate sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Homepage -->
  <url>
    <loc>https://plugin.az/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://plugin.az/"/>
    <xhtml:link rel="alternate" hreflang="az" href="https://plugin.az/"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://plugin.az/"/>
    <lastmod>2026-01-07</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Solar Calculator -->
  <url>
    <loc>https://plugin.az/solar-calculator.html</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://plugin.az/solar-calculator.html"/>
    <xhtml:link rel="alternate" hreflang="az" href="https://plugin.az/solar-calculator.html"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://plugin.az/solar-calculator.html"/>
    <lastmod>2026-01-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Regulatory Framework -->
  <url>
    <loc>https://plugin.az/regulatory-framework.html</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://plugin.az/regulatory-framework.html"/>
    <xhtml:link rel="alternate" hreflang="az" href="https://plugin.az/regulatory-framework.html"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://plugin.az/regulatory-framework.html"/>
    <lastmod>2026-01-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Energy Map -->
  <url>
    <loc>https://plugin.az/azerbaijan-rayon-energy-map.html</loc>
    <lastmod>2026-01-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- News Hub -->
  <url>
    <loc>https://plugin.az/renewable-news.html</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://plugin.az/renewable-news.html"/>
    <xhtml:link rel="alternate" hreflang="az" href="https://plugin.az/renewable-news.html"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://plugin.az/renewable-news.html"/>
    <lastmod>2026-01-07</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Policy Detail Pages -->
  <url>
    <loc>https://plugin.az/policy-detail.html</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://plugin.az/policy-detail.html"/>
    <xhtml:link rel="alternate" hreflang="az" href="https://plugin.az/policy-detail.html"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://plugin.az/policy-detail.html"/>
    <lastmod>2026-01-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- News Articles (${newsData.articles.length} articles) -->
${newsData.articles.map(article => {
    const slug = slugify(article.title);
    const date = formatDate(article.date);
    return `  <url>
    <loc>https://plugin.az/news/${slug}.html</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('\n')}

</urlset>`;

// Write sitemap
const sitemapPath = path.join(__dirname, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

console.log(`✅ Sitemap updated successfully!`);
console.log(`📊 Total URLs: ${newsData.articles.length + 6}`);
console.log(`   - Main pages: 6`);
console.log(`   - News articles: ${newsData.articles.length}`);
console.log(`📁 File: sitemap.xml`);
console.log(`\n💡 Next steps:`);
console.log(`   1. Push to Git`);
console.log(`   2. Deploy to production`);
console.log(`   3. Submit to Google Search Console: https://search.google.com/search-console`);
console.log(`   4. Verify at: https://plugin.az/sitemap.xml`);
