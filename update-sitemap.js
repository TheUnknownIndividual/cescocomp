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

// Helper function to format date with strict YYYY-MM-DD validation
function formatDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];

    try {
        // Handle various date formats
        let date;
        
        // Check if already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            date = new Date(dateStr);
        }
        // Handle DD.MM.YYYY or DD-MM-YYYY or DD/MM/YYYY formats
        else if (/^\d{1,2}[.\-\/]\d{1,2}[.\-\/]\d{4}$/.test(dateStr)) {
            const parts = dateStr.split(/[.\-\/]/);
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            date = new Date(`${year}-${month}-${day}`);
        }
        // Handle ISO format with time
        else if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
            date = new Date(dateStr);
        }
        else {
            // Try to parse as is
            date = new Date(dateStr);
        }
        
        // Validate the date
        if (date instanceof Date && !isNaN(date)) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            // Ensure valid year range (2020-2030 for renewable energy context)
            if (year >= 2020 && year <= 2030) {
                return `${year}-${month}-${day}`;
            }
        }
    } catch (e) {
        console.warn(`⚠️  Could not parse date: ${dateStr}, using current date`);
    }

    // Fallback to current date in strict YYYY-MM-DD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
