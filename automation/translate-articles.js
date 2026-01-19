// Translation Service for News Articles
// Uses MyMemory Translation API (free, no API key required)
// NOW WITH INCREMENTAL PROCESSING: Only translates new articles!

const https = require('https');
const fs = require('fs');
const path = require('path');
const tracking = require('./article-tracking');

class TranslationService {
    constructor() {
        this.cache = new Map();
        this.apiDelay = 500; // Delay between API calls to avoid rate limiting
    }

    async translate(text, sourceLang, targetLang) {
        // Don't translate if source and target are the same
        if (sourceLang === targetLang) return text;

        // Check cache
        const cacheKey = `${text}_${sourceLang}_${targetLang}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

            const translated = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            if (json.responseStatus === 200 && json.responseData.translatedText) {
                                resolve(json.responseData.translatedText);
                            } else {
                                resolve(text); // Return original on error
                            }
                        } catch (e) {
                            resolve(text);
                        }
                    });
                }).on('error', () => resolve(text));
            });

            // Cache the result
            this.cache.set(cacheKey, translated);

            // Delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, this.apiDelay));

            return translated;
        } catch (error) {
            console.warn(`Translation failed for: ${text.substring(0, 50)}...`);
            return text;
        }
    }

    async translateArticle(article, targetLang) {
        console.log(`  → Translating to ${targetLang}: ${article.title.substring(0, 50)}...`);

        const translated = {
            ...article,
            title: await this.translate(article.title, 'az', targetLang),
            excerpt: article.excerpt ? await this.translate(article.excerpt, 'az', targetLang) : '',
            category: await this.translateCategory(article.category, targetLang),
            lang: targetLang
        };

        // Translate content paragraphs
        if (article.content) {
            const contentParts = article.content.split('</p>');
            const translatedParts = [];

            for (const part of contentParts) {
                if (part.trim()) {
                    const text = part.replace(/<[^>]*>/g, '').trim();
                    if (text.length > 20) {
                        const translatedText = await this.translate(text, 'az', targetLang);
                        translatedParts.push(part.replace(text, translatedText));
                    } else {
                        translatedParts.push(part);
                    }
                }
            }

            translated.content = translatedParts.join('</p>');
        }

        return translated;
    }

    translateCategory(category, targetLang) {
        const categoryMap = {
            'Azərbaycan': { en: 'Azerbaijan', ru: 'Азербайджан', az: 'Azərbaycan' },
            'Region': { en: 'Region', ru: 'Регион', az: 'Region' },
            'Dünya': { en: 'World', ru: 'Мир', az: 'Dünya' },
            'Günəş': { en: 'Solar', ru: 'Солнечная', az: 'Günəş' },
            'Külək': { en: 'Wind', ru: 'Ветровая', az: 'Külək' },
            'Hidro': { en: 'Hydro', ru: 'Гидро', az: 'Hidro' }
        };

        return categoryMap[category]?.[targetLang] || category;
    }
}

async function translateAllArticles(newsDataPath, outputPath) {
    console.log('🌍 Starting translation process...\n');

    const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf-8'));
    const translator = new TranslationService();

    const translatedData = {
        ...newsData,
        languages: ['az', 'en', 'ru'],
        articles: {
            az: newsData.articles,
            en: [],
            ru: []
        }
    };

    // Translate to English
    console.log('📝 Translating to English...');
    for (const article of newsData.articles) {
        const translated = await translator.translateArticle(article, 'en');
        translatedData.articles.en.push(translated);
    }

    // Translate to Russian
    console.log('\n📝 Translating to Russian...');
    for (const article of newsData.articles) {
        const translated = await translator.translateArticle(article, 'ru');
        translatedData.articles.ru.push(translated);
    }

    // Save translated data
    fs.writeFileSync(outputPath, JSON.stringify(translatedData, null, 2), 'utf-8');

    console.log('\n✅ Translation complete!');
    console.log(`   - Azerbaijani: ${translatedData.articles.az.length} articles`);
    console.log(`   - English: ${translatedData.articles.en.length} articles`);
    console.log(`   - Russian: ${translatedData.articles.ru.length} articles`);

    return translatedData;
}

module.exports = { TranslationService, translateAllArticles };

// INCREMENTAL TRANSLATION (only translate new articles)
async function translateNewArticlesIncrementally(newsDataPath, outputPath) {
    console.log('🌍 Starting INCREMENTAL translation process...\n');

    try {
        // Load current state
        const newsData = JSON.parse(fs.readFileSync(newsDataPath, 'utf-8'));
        const existingMultilingualData = tracking.loadMultilingualNewsData();
        const processingState = tracking.loadProcessedArticles();

        console.log(`📊 News database: ${newsData.articles.length} articles`);
        console.log(`📊 Translated: ${existingMultilingualData.articles.az ? existingMultilingualData.articles.az.length : 0} articles`);

        // Find articles that need translation
        const articlesToTranslate = tracking.filterArticlesNeedingTranslation(newsData, existingMultilingualData);
        console.log(`✨ Articles needing translation: ${articlesToTranslate.length}\n`);

        if (articlesToTranslate.length === 0) {
            console.log('⏭️  No new articles to translate.');
            return;
        }

        console.log(`⚡ Translating ${articlesToTranslate.length} articles to EN and RU...\n`);

        const translator = new TranslationService();

        // Translate to English
        console.log('📝 Translating to English...');
        const enTranslations = [];
        for (const article of articlesToTranslate) {
            const translated = await translator.translateArticle(article, 'en');
            enTranslations.push(translated);
        }

        // Translate to Russian
        console.log('\n📝 Translating to Russian...');
        const ruTranslations = [];
        for (const article of articlesToTranslate) {
            const translated = await translator.translateArticle(article, 'ru');
            ruTranslations.push(translated);
        }

        // Merge new translations with existing data
        const updatedMultilingualData = tracking.mergeMultilingualData(
            existingMultilingualData,
            enTranslations,
            'en'
        );
        tracking.mergeMultilingualData(updatedMultilingualData, ruTranslations, 'ru');

        // Save merged data
        tracking.saveMultilingualNewsData(updatedMultilingualData);

        // Update processing state
        tracking.updateTrackingStage(articlesToTranslate, 'translated', processingState);
        processingState.lastTranslationDate = new Date().toISOString();
        tracking.saveProcessedArticles(processingState);

        console.log('\n✅ Translation complete!');
        console.log(`   - Azerbaijani: ${updatedMultilingualData.articles.az.length} articles`);
        console.log(`   - English: ${updatedMultilingualData.articles.en.length} articles`);
        console.log(`   - Russian: ${updatedMultilingualData.articles.ru.length} articles`);
        console.log(`   - NEW: ${articlesToTranslate.length} articles translated`);

    } catch (error) {
        console.error('❌ Translation failed:', error);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const newsDataPath = process.argv[2] || path.join(__dirname, '../news-data.json');
    const outputPath = process.argv[3] || path.join(__dirname, '../news-data-multilang.json');

    // Use incremental translation by default
    translateNewArticlesIncrementally(newsDataPath, outputPath)
        .then(() => process.exit(0))
        .catch(error => {
            console.error('❌ Translation failed:', error);
            process.exit(1);
        });
}
