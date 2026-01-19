// Article Tracking Utility
// Maintains state of processed articles to enable incremental processing
// Shared by all automation scripts for deduplication and tracking

const fs = require('fs');
const path = require('path');

const TRACKING_FILE = path.join(__dirname, 'processed-articles.json');
const NEWS_DATA_FILE = path.join(__dirname, '../news-data.json');
const NEWS_DATA_MULTILANG_FILE = path.join(__dirname, '../news-data-multilang.json');

/**
 * Initialize tracking structure if it doesn't exist
 */
function initializeTracking() {
    return {
        lastScrapeDate: null,
        lastTranslationDate: null,
        lastPageGenerationDate: null,
        processedArticles: {} // key: article.link, value: article metadata
    };
}

/**
 * Load processed articles tracking data
 */
function loadProcessedArticles() {
    try {
        if (fs.existsSync(TRACKING_FILE)) {
            const data = fs.readFileSync(TRACKING_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('⚠️ Error loading tracking file, starting fresh:', error.message);
    }
    return initializeTracking();
}

/**
 * Save processed articles tracking data
 */
function saveProcessedArticles(tracking) {
    try {
        fs.writeFileSync(TRACKING_FILE, JSON.stringify(tracking, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('❌ Error saving tracking file:', error.message);
        return false;
    }
}

/**
 * Load existing news data (all articles)
 */
function loadNewsData() {
    try {
        if (fs.existsSync(NEWS_DATA_FILE)) {
            const data = fs.readFileSync(NEWS_DATA_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('⚠️ Error loading news data:', error.message);
    }
    return { lastUpdated: new Date().toISOString(), totalArticles: 0, articles: [] };
}

/**
 * Save news data (all articles)
 */
function saveNewsData(newsData) {
    try {
        fs.writeFileSync(NEWS_DATA_FILE, JSON.stringify(newsData, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('❌ Error saving news data:', error.message);
        return false;
    }
}

/**
 * Load multilingual news data
 */
function loadMultilingualNewsData() {
    try {
        if (fs.existsSync(NEWS_DATA_MULTILANG_FILE)) {
            const data = fs.readFileSync(NEWS_DATA_MULTILANG_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('⚠️ Error loading multilingual data:', error.message);
    }
    return {
        lastUpdated: new Date().toISOString(),
        totalArticles: 0,
        languages: ['az', 'en', 'ru'],
        articles: { az: [], en: [], ru: [] }
    };
}

/**
 * Save multilingual news data
 */
function saveMultilingualNewsData(multiData) {
    try {
        fs.writeFileSync(NEWS_DATA_MULTILANG_FILE, JSON.stringify(multiData, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('❌ Error saving multilingual data:', error.message);
        return false;
    }
}

/**
 * Check if article has already been processed (by link URL)
 */
function isArticleProcessed(articleLink, tracking) {
    return articleLink in tracking.processedArticles;
}

/**
 * Mark articles as processed
 */
function markArticlesProcessed(articles, stage, tracking) {
    for (const article of articles) {
        if (!tracking.processedArticles[article.link]) {
            tracking.processedArticles[article.link] = {
                link: article.link,
                title: article.title,
                firstSeen: new Date().toISOString(),
                stages: {}
            };
        }
        if (!tracking.processedArticles[article.link].stages) {
            tracking.processedArticles[article.link].stages = {};
        }
        tracking.processedArticles[article.link].stages[stage] = new Date().toISOString();
    }
}

/**
 * Get list of unprocessed articles (new articles to scrape)
 * Compares freshly scraped articles against what we've seen before
 */
function filterNewArticles(scrapedArticles, tracking) {
    const newArticles = scrapedArticles.filter(article =>
        !isArticleProcessed(article.link, tracking)
    );
    return newArticles;
}

/**
 * Get articles that need translation (exist in news-data but not in multilang)
 */
function filterArticlesNeedingTranslation(newsData, multilingualData) {
    const multilingualLinks = new Set();

    // Collect all links from existing multilingual data
    if (multilingualData.articles && multilingualData.articles.az) {
        multilingualData.articles.az.forEach(article => {
            multilingualLinks.add(article.link);
        });
    }

    // Find articles not yet translated
    const articlesToTranslate = newsData.articles.filter(article =>
        !multilingualLinks.has(article.link)
    );

    return articlesToTranslate;
}

/**
 * Get articles that need page generation (not yet generated as HTML)
 */
function filterArticlesNeedingPageGeneration(multilingualData, tracking) {
    const articlesNeedingPages = [];

    for (const article of multilingualData.articles.az) {
        if (!tracking.processedArticles[article.link] ||
            !tracking.processedArticles[article.link].stages.pages) {
            articlesNeedingPages.push(article);
        }
    }

    return articlesNeedingPages;
}

/**
 * Update tracking with stage completion
 */
function updateTrackingStage(articles, stage, tracking) {
    const timestamp = new Date().toISOString();
    for (const article of articles) {
        if (tracking.processedArticles[article.link]) {
            if (!tracking.processedArticles[article.link].stages) {
                tracking.processedArticles[article.link].stages = {};
            }
            tracking.processedArticles[article.link].stages[stage] = timestamp;
        }
    }
}

/**
 * Get statistics about processing
 */
function getStats(tracking, newsData, multilingualData) {
    const totalProcessed = Object.keys(tracking.processedArticles).length;
    const totalInNewsData = newsData.articles.length;
    const totalInMultilingual = multilingualData.articles.az ? multilingualData.articles.az.length : 0;

    return {
        totalProcessed,
        totalInNewsData,
        totalInMultilingual,
        processedPercent: Math.round((totalProcessed / Math.max(totalInNewsData, 1)) * 100)
    };
}

/**
 * Merge new articles into existing news data
 */
function mergeNewsData(existingData, newArticles) {
    // Add new articles to the beginning (most recent first)
    const mergedArticles = [...newArticles, ...existingData.articles];

    // Remove true duplicates (by link) - keep first occurrence
    const seenLinks = new Set();
    const uniqueArticles = [];

    for (const article of mergedArticles) {
        if (!seenLinks.has(article.link)) {
            seenLinks.add(article.link);
            uniqueArticles.push(article);
        }
    }

    return {
        lastUpdated: new Date().toISOString(),
        totalArticles: uniqueArticles.length,
        articles: uniqueArticles
    };
}

/**
 * Merge new translations into existing multilingual data
 */
function mergeMultilingualData(existingData, newArticles, language) {
    if (!existingData.articles[language]) {
        existingData.articles[language] = [];
    }

    // Add new articles to the beginning
    const mergedArticles = [...newArticles, ...existingData.articles[language]];

    // Remove duplicates (by link) - keep first occurrence
    const seenLinks = new Set();
    const uniqueArticles = [];

    for (const article of mergedArticles) {
        if (!seenLinks.has(article.link)) {
            seenLinks.add(article.link);
            uniqueArticles.push(article);
        }
    }

    return {
        ...existingData,
        lastUpdated: new Date().toISOString(),
        totalArticles: uniqueArticles.length,
        articles: {
            ...existingData.articles,
            [language]: uniqueArticles
        }
    };
}

module.exports = {
    // Initialization
    initializeTracking,

    // Loading/Saving
    loadProcessedArticles,
    saveProcessedArticles,
    loadNewsData,
    saveNewsData,
    loadMultilingualNewsData,
    saveMultilingualNewsData,

    // Processing checks
    isArticleProcessed,
    markArticlesProcessed,
    filterNewArticles,
    filterArticlesNeedingTranslation,
    filterArticlesNeedingPageGeneration,
    updateTrackingStage,

    // Utilities
    getStats,
    mergeNewsData,
    mergeMultilingualData,

    // File paths
    TRACKING_FILE,
    NEWS_DATA_FILE,
    NEWS_DATA_MULTILANG_FILE
};
