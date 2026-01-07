// Vercel Serverless Function to fetch renewable energy news
// Endpoint: /api/fetch-news
// Caches results for 1 hour to avoid rate limiting

const https = require('https');

const CATEGORIES = [
    { name: 'Azərbaycan', url: 'https://renewables.az/az/category/Azerbaycan/news' },
    { name: 'Region', url: 'https://renewables.az/az/category/Region/news' },
    { name: 'Dünya', url: 'https://renewables.az/az/category/dunya/news' },
    { name: 'Günəş', url: 'https://renewables.az/az/category/gunes/news' },
    { name: 'Külək', url: 'https://renewables.az/az/category/kulek/news' },
    { name: 'Hidro', url: 'https://renewables.az/az/category/hidro/news' }
];

// In-memory cache (for this function instance)
let cachedData = null;
let cacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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

async function scrapeAllNews() {
    console.log('🌱 Fetching news from renewables.az...');
    
    const allNews = [];
    
    for (const category of CATEGORIES) {
        try {
            const html = await fetchPage(category.url);
            const news = parseNewsCards(html);
            
            news.forEach(item => item.category = category.name);
            allNews.push(...news);
            
            console.log(`✓ ${category.name}: ${news.length} articles`);
            
            // Small delay to be respectful
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`✗ Error fetching ${category.name}:`, error.message);
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
    
    return {
        lastUpdated: new Date().toISOString(),
        totalArticles: uniqueNews.length,
        articles: uniqueNews
    };
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Check if we have cached data that's still fresh
        const now = Date.now();
        if (cachedData && cacheTime && (now - cacheTime) < CACHE_DURATION) {
            console.log('✓ Returning cached data');
            return res.status(200).json({
                ...cachedData,
                cached: true,
                cacheAge: Math.floor((now - cacheTime) / 1000)
            });
        }
        
        // Fetch fresh data
        const newsData = await scrapeAllNews();
        
        // Update cache
        cachedData = newsData;
        cacheTime = now;
        
        console.log(`✅ Fetched ${newsData.totalArticles} articles`);
        
        return res.status(200).json({
            ...newsData,
            cached: false
        });
        
    } catch (error) {
        console.error('Error fetching news:', error);
        
        // Return cached data if available, even if stale
        if (cachedData) {
            return res.status(200).json({
                ...cachedData,
                cached: true,
                stale: true,
                error: 'Failed to fetch fresh data, returning cached version'
            });
        }
        
        return res.status(500).json({
            error: 'Failed to fetch news',
            message: error.message,
            lastUpdated: new Date().toISOString(),
            totalArticles: 0,
            articles: []
        });
    }
};
