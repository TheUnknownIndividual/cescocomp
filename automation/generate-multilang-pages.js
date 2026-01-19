// Generate Multilingual News Pages
// Creates AZ/EN/RU versions of each article with proper hreflang tags
// NOW WITH INCREMENTAL PROCESSING: Only generates pages for new articles!

const fs = require('fs');
const path = require('path');
const tracking = require('./article-tracking');

// Create language directories
const newsDir = path.join(__dirname, '../news');
['az', 'en', 'ru'].forEach(lang => {
    const langDir = path.join(newsDir, lang);
    if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
    }
});

// Read multilingual news data
const newsDataPath = path.join(__dirname, '../news-data-multilang.json');
const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf-8'));

// Read template
const templatePath = path.join(__dirname, '../news-article-template.html');
const template = fs.readFileSync(templatePath, 'utf-8');

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100);
}

function generateHreflangTags(slug, currentLang) {
    const langs = ['az', 'en', 'ru'];
    return langs.map(lang =>
        `<link rel="alternate" hreflang="${lang}" href="https://plugin.az/news/${lang}/${slug}" />`
    ).join('\n    ');
}

function generateArticlePage(article, lang) {
    const slug = slugify(article.title);
    const hreflangTags = generateHreflangTags(slug, lang);

    const articleData = {
        ARTICLE_TITLE: article.title,
        ARTICLE_SLUG: slug,
        ARTICLE_CATEGORY: article.category,
        ARTICLE_DATE: article.date || 'Recent',
        ARTICLE_DATE_ISO: article.date ? new Date(article.date.split(' ')[0].split('.').reverse().join('-')).toISOString() : new Date().toISOString(),
        ARTICLE_IMAGE: article.image || '/tablogo.png',
        ARTICLE_EXCERPT: article.excerpt || article.title.substring(0, 155),
        ARTICLE_KEYWORDS: `${article.category}, Azerbaijan, renewable energy, ${lang}`,
        ORIGINAL_LINK: article.link,
        ARTICLE_CONTENT: article.content || `<p>${article.title}</p>`,
        HREFLANG_TAGS: hreflangTags,
        ARTICLE_LANG: lang,
        RELATED_ARTICLES_HTML: '' // Can be populated later
    };

    // JSON-escaped versions
    Object.keys(articleData).forEach(key => {
        if (typeof articleData[key] === 'string' && !key.includes('HTML') && !key.includes('TAGS')) {
            articleData[`${key}_JSON`] = JSON.stringify(articleData[key]).slice(1, -1);
        }
    });

    let articleHTML = template;
    Object.keys(articleData).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        articleHTML = articleHTML.replace(regex, articleData[key]);
    });

    return articleHTML;
}

// INCREMENTAL PAGE GENERATION (only generate for new articles)
(async () => {
    try {
        console.log('📄 Generating multilingual news pages (INCREMENTAL)...\n');

        // Load processing state
        const processingState = tracking.loadProcessedArticles();

        console.log(`📊 Articles needing pages: Checking...`);

        let totalGenerated = 0;
        let totalSkipped = 0;

        ['az', 'en', 'ru'].forEach(lang => {
            console.log(`\n🌐 Processing ${lang.toUpperCase()} articles...`);
            const articles = newsData.articles[lang];

            // Determine which articles need page generation
            const articlesNeedingPages = articles.filter(article => {
                // Skip if already processed
                const alreadyProcessed = processingState.processedArticles[article.link] &&
                    processingState.processedArticles[article.link].stages &&
                    processingState.processedArticles[article.link].stages.pages;
                return !alreadyProcessed;
            });

            console.log(`  Total: ${articles.length} | New: ${articlesNeedingPages.length} | Existing: ${articles.length - articlesNeedingPages.length}`);

            articlesNeedingPages.forEach((article, index) => {
                const slug = slugify(article.title);
                const fileName = `${slug}.html`;
                const filePath = path.join(newsDir, lang, fileName);

                const articleHTML = generateArticlePage(article, lang);
                fs.writeFileSync(filePath, articleHTML, 'utf-8');
                totalGenerated++;

                // Mark as processed
                if (!processingState.processedArticles[article.link]) {
                    processingState.processedArticles[article.link] = { link: article.link, stages: {} };
                }
                if (!processingState.processedArticles[article.link].stages) {
                    processingState.processedArticles[article.link].stages = {};
                }
                processingState.processedArticles[article.link].stages.pages = new Date().toISOString();

                if ((index + 1) % 20 === 0) {
                    console.log(`  ✓ Generated ${index + 1}/${articlesNeedingPages.length} articles...`);
                }
            });

            totalSkipped += articles.length - articlesNeedingPages.length;
            console.log(`  ✅ ${lang.toUpperCase()}: ${articlesNeedingPages.length} NEW pages generated`);
        });

        // Save updated processing state
        processingState.lastPageGenerationDate = new Date().toISOString();
        tracking.saveProcessedArticles(processingState);

        console.log(`\n✅ Page generation complete!`);
        console.log(`   - New pages: ${totalGenerated} (3 languages)`);
        console.log(`   - Skipped: ${totalSkipped} (already existed)`);
        console.log(`   - Efficiency: ${((totalSkipped / (totalGenerated + totalSkipped)) * 100).toFixed(1)}% reused`);
        console.log(`📁 Location: /news/{az,en,ru}/`);

    } catch (error) {
        console.error('❌ Error generating pages:', error);
        process.exit(1);
    }
})();
