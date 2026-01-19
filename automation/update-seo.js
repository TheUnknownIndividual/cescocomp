// Update SEO: Sitemap and Metadata
// Generates sitemap.xml with multilingual URLs and proper SEO tags
// With tracking for incremental processing

const fs = require('fs');
const path = require('path');
const tracking = require('./article-tracking');

const newsDataPath = path.join(__dirname, '../news-data-multilang.json');
const sitemapPath = path.join(__dirname, '../sitemap.xml');

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100);
}

function formatDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];

    try {
        const parts = dateStr.split(/[.\s]/);
        if (parts.length >= 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    } catch (e) {
        console.warn(`Could not parse date: ${dateStr}`);
    }

    return new Date().toISOString().split('T')[0];
}

console.log('🗺️  Updating sitemap with multilingual URLs...\n');

// Load processing state for comparison
const processingState = tracking.loadProcessedArticles();
let previousSitemapSize = 0;

// Check if sitemap exists (for comparison)
if (fs.existsSync(sitemapPath)) {
    try {
        const previousSitemap = fs.readFileSync(sitemapPath, 'utf-8');
        previousSitemapSize = (previousSitemap.match(/<url>/g) || []).length;
    } catch (e) {
        // Ignore errors reading old sitemap
    }
}

const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf-8'));

// Main pages
const mainPages = [
    { url: 'https://plugin.az/', priority: '1.0', changefreq: 'daily' },
    { url: 'https://plugin.az/renewable-news', priority: '0.9', changefreq: 'daily' },
    { url: 'https://plugin.az/solar-calculator', priority: '0.8', changefreq: 'weekly' },
    { url: 'https://plugin.az/regulatory-framework', priority: '0.8', changefreq: 'weekly' },
    { url: 'https://plugin.az/energy-map', priority: '0.7', changefreq: 'monthly' },
    { url: 'https://plugin.az/renewable-targets', priority: '0.7', changefreq: 'monthly' }
];

// Generate news URLs for all languages
const newsUrls = [];
['az', 'en', 'ru'].forEach(lang => {
    const articles = newsData.articles[lang];
    articles.forEach(article => {
        const slug = slugify(article.title);
        const lastmod = formatDate(article.date);
        newsUrls.push({
            url: `https://plugin.az/news/${lang}/${slug}`,
            lastmod,
            changefreq: 'monthly',
            priority: '0.7'
        });
    });
});

// Build sitemap XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

// Add main pages
mainPages.forEach(page => {
    sitemap += `  <url>
    <loc>${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
});

// Add news articles
newsUrls.forEach(page => {
    sitemap += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
});

sitemap += `</urlset>`;

// Write sitemap
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

// Update processing state
processingState.lastPageGenerationDate = new Date().toISOString();
tracking.saveProcessedArticles(processingState);

const newSitemapSize = mainPages.length + newsUrls.length;
const sizeChange = newSitemapSize - previousSitemapSize;

console.log('✅ Sitemap updated successfully!');
console.log(`📊 Total URLs: ${newSitemapSize}`);
console.log(`   - Main pages: ${mainPages.length}`);
console.log(`   - News articles (AZ): ${newsData.articles.az.length}`);
console.log(`   - News articles (EN): ${newsData.articles.en.length}`);
console.log(`   - News articles (RU): ${newsData.articles.ru.length}`);

if (previousSitemapSize > 0) {
    const change = sizeChange >= 0 ? '+' : '';
    console.log(`   - Change: ${change}${sizeChange} URLs`);
}

console.log(`📁 File: sitemap.xml`);
console.log(`\n💡 Submit to Google Search Console: https://search.google.com/search-console`);
