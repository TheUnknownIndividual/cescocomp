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

// FIXED: Fetch full article content from individual article page
async function fetchArticleContent(articleUrl) {
    try {
        console.log(`  → Fetching content from: ${articleUrl}`);
        const html = await fetchPage(articleUrl);

        // Strategy: Extract all <p> tags from the article, excluding navigation/related content
        let content = '';

        // First, try to find the main article container
        const articleMatch = html.match(/<div class="news-details">([\s\S]*?)<div class="row justify-content/);

        if (articleMatch) {
            const articleSection = articleMatch[1];

            // Extract all paragraph tags from this section
            const paragraphs = articleSection.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);

            if (paragraphs && paragraphs.length > 0) {
                // Filter out empty or very short paragraphs, and navigation elements
                const validParagraphs = paragraphs.filter(p => {
                    const text = p.replace(/<[^>]*>/g, '').trim();
                    return text.length > 20 && !text.includes('href='); // Exclude link-only paragraphs
                });

                if (validParagraphs.length > 0) {
                    content = validParagraphs.join('\n');
                }
            }
        }

        // Fallback: If above didn't work, extract ALL paragraphs from page and filter
        if (!content || content.length < 100) {
            const allParagraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
            if (allParagraphs && allParagraphs.length > 0) {
                // Find paragraphs that look like article content (longer, meaningful text)
                const contentParagraphs = allParagraphs.filter(p => {
                    const text = p.replace(/<[^>]*>/g, '').trim();
                    // Must be substantial text, not just links or short snippets
                    return text.length > 50 &&
                        !text.includes('class=') &&
                        !text.includes('href=') &&
                        !text.match(/^\d{2}\.\d{2}\.\d{4}/); // Not a date
                });

                if (contentParagraphs.length > 0) {
                    // Take the first 10-15 meaningful paragraphs
                    content = contentParagraphs.slice(0, 15).join('\n');
                }
            }
        }

        // Clean up the content
        if (content) {
            content = content
                // Remove any remaining scripts/styles
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                // Make images responsive
                .replace(/<img /gi, '<img style="max-width: 100%; height: auto;" ')
                // Convert h3 to h2
                .replace(/<h3([^>]*)>/gi, '<h2$1>')
                .replace(/<\/h3>/gi, '</h2>')
                // Clean up whitespace
                .replace(/\s\s+/g, ' ')
                .trim();
        }

        // Extract excerpt from first paragraph
        let excerpt = '';
        const excerptMatch = content.match(/<p[^>]*>(.*?)<\/p>/);
        if (excerptMatch) {
            excerpt = excerptMatch[1]
                .replace(/<[^>]*>/g, '')
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&[^;]+;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 155);
        }

        // Final validation
        if (!content || content.length < 100) {
            console.warn(`  ⚠️  Could not extract content from: ${articleUrl}`);
            content = '<p>Ətraflı məlumat üçün orijinal mənbəyə baxın.</p>';
            excerpt = 'Azərbaycanda bərpa olunan enerji sahəsində son xəbərlər və yeniliklər.';
        } else {
            console.log(`  ✓ Extracted ${content.length} chars of actual content`);
        }

        return {
            content,
            excerpt,
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
