// Enhanced News Scraper with Full Article Content
// Fetches complete articles from renewables.az with permission
// Automatically generates SEO-optimized pages

const https = require('https');
const fs = require('fs');
const path = require('path');

const CATEGORIES = [
    { name: 'Azərbaycan', url: 'https://renewables.az/az/category/Azerbaycan/news' },
    { name: 'Region', url: 'https://renewables.az/az/category/Region/news' },
    { name: 'Dünya', url: 'https://renewables.az/az/category/dunya/news' },
    { name: 'Günəş', url: 'https://renewables.az/az/category/gunes/news' },
    { name: 'Külək', url: 'https://renewables.az/az/category/kulek/news' },
    { name: 'Hidro', url: 'https://renewables.az/az/category/hidro/news' }
];

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseNewsCards(html) {
    const newsItems = [];
    const cardRegex = /<div class="col-lg-4 col-md-4 col-sm-6 col-12">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;

    let match;
    while ((match = cardRegex.exec(html)) !== null) {
        const cardHtml = match[1];

        const linkMatch = cardHtml.match(/<a href="(https:\/\/renewables\.az\/az\/news\/[^"]+)"/);
        const link = linkMatch ? linkMatch[1] : null;

        const imgMatch = cardHtml.match(/<img src="(https:\/\/renewables\.az\/storage\/news_images\/[^"]+)"/);
        const image = imgMatch ? imgMatch[1] : null;

        const dateMatch = cardHtml.match(/<i class="icofont-calendar"><\/i>\s*([^<]+)</);
        const date = dateMatch ? dateMatch[1].trim() : null;

        const titleMatch = cardHtml.match(/<h3>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h3>/);
        let title = titleMatch ? titleMatch[1].trim() : null;

        if (title) {
            title = title.replace(/\s+/g, ' ').trim();
        }

        if (link && title) {
            newsItems.push({
                title,
                date,
                image,
                link,
                source: 'renewables.az'
            });
        }
    }

    return newsItems;
}

// Enhanced: Fetch full article content from individual article page
async function fetchArticleContent(articleUrl) {
    try {
        console.log(`  → Fetching content from: ${articleUrl}`);
        const html = await fetchPage(articleUrl);

        // Try multiple patterns to extract article content
        let content = '';

        // Pattern 1: blog-post-content (ACTUAL structure!)
        let contentMatch = html.match(/<div class="blog-post-content">([\s\S]*?)<\/div>\s*<div class="row justify-content/);

        // Pattern 2: Try to get all blog-post-content divs
        if (!contentMatch) {
            const matches = html.match(/<div class="blog-post-content">([\s\S]*?)<\/div>/g);
            if (matches && matches.length > 0) {
                // Combine all matches
                content = matches.join('\n');
                contentMatch = [null, content]; // Fake match for processing below
            }
        }

        // Pattern 3: Try news-details as fallback
        if (!contentMatch) {
            contentMatch = html.match(/<div class="news-details">([\s\S]*?)<\/div>\s*<\/div>/);
        }

        // Pattern 4: Try article-content
        if (!contentMatch) {
            contentMatch = html.match(/<div class="article-content">([\s\S]*?)<\/div>/);
        }

        if (contentMatch && contentMatch[1]) {
            content = contentMatch[1]
                // Remove scripts and styles
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                // Keep images but make them responsive
                .replace(/<img /gi, '<img style="max-width: 100%; height: auto;" ')
                // Convert h3 to h2 for better SEO
                .replace(/<h3([^>]*)>/gi, '<h2$1>')
                .replace(/<\/h3>/gi, '</h2>')
                // Remove share buttons and similar
                .replace(/<div class="news-details-share[\s\S]*?<\/div>/gi, '')
                .replace(/<div class="news-details-tags[\s\S]*?<\/div>/gi, '')
                .replace(/<div class="row justify-content[\s\S]*?<\/div>/gi, '')
                // Clean up excessive whitespace but preserve paragraph structure
                .replace(/\s\s+/g, ' ')
                .trim();
        }

        // If still no content, try to extract just paragraphs
        if (!content || content.length < 50) {
            const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
            if (paragraphs && paragraphs.length > 0) {
                content = paragraphs
                    .filter(p => p.length > 20) // Filter out tiny paragraphs
                    .slice(0, 15) // Take first 15 paragraphs
                    .join('\n');
            }
        }

        // Extract excerpt from first paragraph
        const excerptMatch = content.match(/<p[^>]*>(.*?)<\/p>/);
        let excerpt = '';
        if (excerptMatch) {
            excerpt = excerptMatch[1]
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&[^;]+;/g, ' ') // Remove HTML entities
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim()
                .substring(0, 155);
        }

        // Final check - if content is too short, use fallback
        if (!content || content.length < 50) {
            console.warn(`  ⚠️  Short content for: ${articleUrl}`);
            content = '<p>Ətraflı məlumat üçün orijinal mənbəyə baxın.</p>';
            excerpt = 'Azərbaycanda bərpa olunan enerji sahəsində son xəbərlər və yeniliklər.';
        } else {
            console.log(`  ✓ Extracted ${content.length} chars`);
        }

        return {
            content,
            excerpt: excerpt || 'Azərbaycanda bərpa olunan enerji sahəsində son xəbərlər və yeniliklər.'
        };
    } catch (error) {
        console.error(`  ✗ Error fetching article content: ${error.message}`);
        return {
            content: '<p>Ətraflı məlumat üçün orijinal mənbəyə baxın.</p>',
            excerpt: 'Azərbaycanda bərpa olunan enerji sahəsində son xəbərlər və yeniliklər.'
        };
    }
}

async function scrapeAllNews() {
    console.log('🌱 Fetching news from renewables.az (with permission)...\n');

    const fetchPromises = CATEGORIES.map(async (category) => {
        try {
            console.log(`📂 Fetching category: ${category.name}`);
            const html = await fetchPage(category.url);
            const news = parseNewsCards(html);

            // Fetch full content for ALL articles (no limit!)
            const newsWithContent = [];
            for (let i = 0; i < news.length; i++) {
                const article = news[i];
                const { content, excerpt } = await fetchArticleContent(article.link);
                newsWithContent.push({
                    ...article,
                    category: category.name,
                    content,
                    excerpt
                });

                // Small delay to be respectful to the server
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log(`✓ ${category.name}: ${newsWithContent.length} articles with full content\n`);
            return newsWithContent;
        } catch (error) {
            console.error(`✗ Error fetching ${category.name}:`, error.message);
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);
    const allNews = results.flat();

    // Remove duplicates based on link
    const uniqueNews = Array.from(
        new Map(allNews.map(item => [item.link, item])).values()
    );

    // Sort by date (most recent first)
    uniqueNews.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.localeCompare(a.date);
    });

    return {
        lastUpdated: new Date().toISOString(),
        totalArticles: uniqueNews.length,
        articles: uniqueNews,
        attribution: {
            source: 'renewables.az',
            permission: 'Granted via email communication',
            date: '2026-01-07',
            note: 'Content used with permission from renewables.az for educational purposes'
        }
    };
}

// Main execution
(async () => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  RENEWABLES.AZ NEWS SCRAPER (WITH FULL CONTENT)');
        console.log('  Permission granted via email - Educational use');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const newsData = await scrapeAllNews();

        // Save to JSON file
        const outputPath = path.join(__dirname, 'news-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(newsData, null, 2), 'utf-8');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ SUCCESS! Fetched ${newsData.totalArticles} articles with full content`);
        console.log(`📁 Saved to: news-data.json`);
        console.log(`📰 Attribution: ${newsData.attribution.source}`);
        console.log(`✉️  Permission: ${newsData.attribution.permission}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('💡 Next steps:');
        console.log('   1. Run: node generate-news-pages.js (to create HTML pages)');
        console.log('   2. Run: node update-sitemap.js (to update sitemap)');
        console.log('   3. Commit and push to Git');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
