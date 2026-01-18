// API endpoint: /api/news-with-links
// Returns latest news articles with links to both original source and plugin.az pages
// Used by Telegram bot and frontend to fetch news with direct article page links

const fs = require('fs');
const path = require('path');

// In-memory cache for this function instance
let cachedData = null;
let cacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Convert article title to URL-friendly slug
 * Matches the slugify function in generate-multilang-pages.js
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
        .substring(0, 100); // Limit length
}

/**
 * Load news data from JSON file
 */
function loadNewsData() {
    try {
        const dataPath = path.join(process.cwd(), 'news-data.json');
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error loading news data:', error);
        return { articles: [], lastUpdated: new Date().toISOString(), totalArticles: 0 };
    }
}

/**
 * Enhance articles with plugin.az page links
 */
function enrichArticlesWithLinks(newsData) {
    return {
        ...newsData,
        articles: newsData.articles.map(article => ({
            ...article,
            id: slugify(article.title),
            plugin_page_link: `https://plugin.az/news/${slugify(article.title)}`,
            source_link: article.link, // Original renewables.az link
        }))
    };
}

/**
 * Filter articles by category
 */
function filterByCategory(articles, category) {
    if (!category) return articles;
    return articles.filter(article =>
        article.category && article.category.toLowerCase() === category.toLowerCase()
    );
}

/**
 * Limit number of articles returned
 */
function limitArticles(articles, limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
        return articles.slice(0, limitNum);
    }
    return articles;
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    // Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'Only GET requests are supported'
        });
    }

    try {
        // Check if we have cached data that's still fresh
        const now = Date.now();
        if (cachedData && cacheTime && (now - cacheTime) < CACHE_DURATION) {
            console.log('✓ Returning cached news data');

            let articles = cachedData.articles;

            // Apply filters if requested
            const { category, limit } = req.query;
            articles = filterByCategory(articles, category);
            articles = limitArticles(articles, limit);

            return res.status(200).json({
                lastUpdated: cachedData.lastUpdated,
                totalArticles: cachedData.totalArticles,
                returnedArticles: articles.length,
                articles,
                cached: true,
                cacheAge: Math.floor((now - cacheTime) / 1000)
            });
        }

        // Load and enrich news data
        console.log('📰 Loading news data with plugin.az links...');
        const newsData = loadNewsData();
        const enrichedData = enrichArticlesWithLinks(newsData);

        // Update cache
        cachedData = enrichedData;
        cacheTime = now;

        // Apply filters if requested
        let articles = enrichedData.articles;
        const { category, limit } = req.query;
        articles = filterByCategory(articles, category);
        articles = limitArticles(articles, limit);

        console.log(`✅ Loaded ${enrichedData.totalArticles} total articles, returning ${articles.length}`);

        return res.status(200).json({
            lastUpdated: enrichedData.lastUpdated,
            totalArticles: enrichedData.totalArticles,
            returnedArticles: articles.length,
            articles,
            cached: false
        });

    } catch (error) {
        console.error('Error fetching news with links:', error);

        // Return cached data if available, even if stale
        if (cachedData) {
            return res.status(200).json({
                ...cachedData,
                cached: true,
                stale: true,
                error: 'Failed to fetch fresh data, returning cached version',
                message: error.message
            });
        }

        return res.status(500).json({
            error: 'Failed to fetch news',
            message: error.message,
            lastUpdated: new Date().toISOString(),
            totalArticles: 0,
            returnedArticles: 0,
            articles: []
        });
    }
};
