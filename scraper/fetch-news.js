const https = require('https');
const fs = require('fs');

/**
 * Fetches renewable energy news from renewables.az
 * Parses HTML and extracts news cards with title, date, image, and link
 */

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
        
        // Extract link
        const linkMatch = cardHtml.match(/<a href="(https:\/\/renewables\.az\/az\/news\/[^"]+)"/);
        const link = linkMatch ? linkMatch[1] : null;
        
        // Extract image
        const imgMatch = cardHtml.match(/<img src="(https:\/\/renewables\.az\/storage\/news_images\/[^"]+)"/);
        const image = imgMatch ? imgMatch[1] : null;
        
        // Extract date
        const dateMatch = cardHtml.match(/<i class="icofont-calendar"><\/i>\s*([^<]+)</);
        const date = dateMatch ? dateMatch[1].trim() : null;
        
        // Extract title
        const titleMatch = cardHtml.match(/<h3>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h3>/);
        let title = titleMatch ? titleMatch[1].trim() : null;
        
        // Clean up title (remove extra whitespace)
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

async function scrapeAllNews() {
    console.log('🌱 Starting news scraper for renewables.az...\n');
    
    const allNews = [];
    
    for (const category of CATEGORIES) {
        console.log(`📰 Fetching ${category.name}...`);
        try {
            const html = await fetchPage(category.url);
            const news = parseNewsCards(html);
            
            // Add category to each news item
            news.forEach(item => item.category = category.name);
            
            allNews.push(...news);
            console.log(`   ✓ Found ${news.length} articles\n`);
            
            // Delay to be respectful to server
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`   ✗ Error fetching ${category.name}:`, error.message);
        }
    }
    
    // Remove duplicates based on link
    const uniqueNews = Array.from(
        new Map(allNews.map(item => [item.link, item])).values()
    );
    
    // Sort by date (most recent first)
    uniqueNews.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.localeCompare(a.date);
    });
    
    console.log(`\n✅ Total unique articles: ${uniqueNews.length}`);
    
    // Save to JSON file
    const outputPath = './news-data.json';
    fs.writeFileSync(outputPath, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        totalArticles: uniqueNews.length,
        articles: uniqueNews
    }, null, 2));
    
    console.log(`💾 Saved to ${outputPath}\n`);
    
    return uniqueNews;
}

// Run scraper
scrapeAllNews().catch(console.error);
