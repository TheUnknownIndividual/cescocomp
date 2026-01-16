// Generate Multilingual News Pages
// Creates AZ/EN/RU versions of each article with proper hreflang tags

const fs = require('fs');
const path = require('path');

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

console.log('📄 Generating multilingual news pages...\n');

let totalGenerated = 0;

['az', 'en', 'ru'].forEach(lang => {
    console.log(`\n🌐 Generating ${lang.toUpperCase()} pages...`);
    const articles = newsData.articles[lang];

    articles.forEach((article, index) => {
        const slug = slugify(article.title);
        const fileName = `${slug}.html`;
        const filePath = path.join(newsDir, lang, fileName);

        const articleHTML = generateArticlePage(article, lang);
        fs.writeFileSync(filePath, articleHTML, 'utf-8');
        totalGenerated++;

        if ((index + 1) % 20 === 0) {
            console.log(`  ✓ Generated ${index + 1}/${articles.length} articles...`);
        }
    });

    console.log(`  ✅ ${lang.toUpperCase()}: ${articles.length} articles generated`);
});

console.log(`\n✅ Total: ${totalGenerated} multilingual pages generated`);
console.log(`📁 Location: /news/{az,en,ru}/`);
