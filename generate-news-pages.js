// Script to generate individual news article pages from news-data.json
// This creates SEO-friendly static pages for each news article

const fs = require('fs');
const path = require('path');

// Read the template
const templatePath = path.join(__dirname, 'news-article-template.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// Read news data
const newsDataPath = path.join(__dirname, 'news-data.json');
const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf-8'));

// Create news directory if it doesn't exist
const newsDir = path.join(__dirname, 'news');
if (!fs.existsSync(newsDir)) {
    fs.mkdirSync(newsDir);
}

// Helper function to create URL-friendly slug
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100); // Limit length for URLs
}

// Helper function to create excerpt
function createExcerpt(title, maxLength = 155) {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
}

// Helper function to extract keywords from title and category
function extractKeywords(title, category) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .slice(0, 5);

    return [category, ...words, 'Azerbaijan', 'renewable energy'].join(', ');
}

// Helper function to format date to ISO 8601
function formatDateISO(dateStr) {
    if (!dateStr) return new Date().toISOString();

    // Try to parse the date string
    try {
        // Assuming format like "DD.MM.YYYY" or similar
        const parts = dateStr.split(/[.\-\/]/);
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).toISOString();
        }
    } catch (e) {
        console.warn(`Could not parse date: ${dateStr}`);
    }

    return new Date().toISOString();
}

// Generate article pages
let generatedCount = 0;
const articles = newsData.articles || [];

console.log(`📰 Generating ${articles.length} news article pages...`);

articles.forEach((article, index) => {
    const slug = slugify(article.title);
    const fileName = `${slug}.html`;
    const filePath = path.join(newsDir, fileName);

    // Prepare article data
    const articleData = {
        ARTICLE_TITLE: article.title,
        ARTICLE_SLUG: slug,
        ARTICLE_CATEGORY: article.category || 'News',
        ARTICLE_DATE: article.date || 'Recent',
        ARTICLE_DATE_ISO: formatDateISO(article.date),
        ARTICLE_IMAGE: article.image || '/tablogo.png',
        ARTICLE_EXCERPT: article.excerpt || createExcerpt(article.title),
        ARTICLE_KEYWORDS: extractKeywords(article.title, article.category || 'renewable energy'),
        ORIGINAL_LINK: article.link,
        ARTICLE_CONTENT: article.content || `
            <p>${article.title}</p>
            <p>Bu xəbər Azərbaycanda bərpa olunan enerji sahəsində mühüm inkişaflar haqqında məlumat verir.</p>
            <p>Ətraflı məlumat üçün aşağıdakı orijinal mənbəyə baxın.</p>
        `
    };

    // Add JSON-escaped versions for usage in <script type="application/ld+json">
    articleData.ARTICLE_TITLE_JSON = JSON.stringify(articleData.ARTICLE_TITLE).slice(1, -1);
    articleData.ARTICLE_EXCERPT_JSON = JSON.stringify(articleData.ARTICLE_EXCERPT).slice(1, -1);
    articleData.ARTICLE_IMAGE_JSON = JSON.stringify(articleData.ARTICLE_IMAGE).slice(1, -1);
    articleData.ARTICLE_CATEGORY_JSON = JSON.stringify(articleData.ARTICLE_CATEGORY).slice(1, -1);

    // Replace placeholders in template
    let articleHTML = template;
    Object.keys(articleData).forEach(key => {
        // Use a more specific regex to avoid partial matches if keys share prefixes (though unlikely here)
        const regex = new RegExp(`{{${key}}}`, 'g');
        articleHTML = articleHTML.replace(regex, articleData[key]);
    });

    // Write the file
    fs.writeFileSync(filePath, articleHTML, 'utf-8');
    generatedCount++;

    if ((index + 1) % 10 === 0) {
        console.log(`  ✓ Generated ${index + 1}/${articles.length} articles...`);
    }
});

console.log(`\n✅ Successfully generated ${generatedCount} news article pages in /news/ directory`);
console.log(`📁 Articles are SEO-optimized with proper meta tags and structured data`);
console.log(`🔗 Each article includes proper attribution to renewables.az`);

// Generate a sitemap entry list
const sitemapEntries = articles.map(article => {
    const slug = slugify(article.title);
    const dateISO = formatDateISO(article.date);
    return `  <url>
    <loc>https://plugin.az/news/${slug}.html</loc>
    <lastmod>${dateISO.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('\n');

console.log(`\n📝 Add these entries to your sitemap.xml:\n`);
console.log(sitemapEntries.substring(0, 500) + '...\n');

console.log(`\n💡 Next steps:`);
console.log(`  1. Update renewable-news.html to link to /news/{slug}.html instead of external links`);
console.log(`  2. Add news article URLs to sitemap.xml`);
console.log(`  3. Submit updated sitemap to Google Search Console`);
console.log(`  4. Consider adding a robots.txt entry for /news/ directory`);
