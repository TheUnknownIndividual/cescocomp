#!/usr/bin/env node
// Daily News Update Orchestrator
// Fetches news, translates, generates pages, updates SEO, and pushes to Git
// NOW WITH INCREMENTAL PROCESSING: Smart detection of new content!

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const tracking = require('./article-tracking');

const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, `update-${new Date().toISOString().split('T')[0]}.log`);

class NewsUpdateOrchestrator {
    constructor() {
        this.startTime = Date.now();
        this.errors = [];

        // Ensure log directory exists
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(LOG_FILE, logMessage + '\n');
    }

    exec(command, description) {
        this.log(`Executing: ${description}`);
        try {
            const output = execSync(command, {
                cwd: path.join(__dirname, '..'),
                encoding: 'utf-8',
                stdio: 'pipe'
            });
            this.log(`✓ ${description} completed`);
            return output;
        } catch (error) {
            const errorMsg = `✗ ${description} failed: ${error.message}`;
            this.log(errorMsg, 'ERROR');
            this.errors.push(errorMsg);
            throw error;
        }
    }

    async run() {
        this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.log('  PLUGIN.AZ - AUTOMATED NEWS UPDATE (INCREMENTAL)');
        this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            // Load initial state
            const initialProcessingState = tracking.loadProcessedArticles();
            const initialArticleCount = Object.keys(initialProcessingState.processedArticles).length;
            this.log(`\n📊 Initial state: ${initialArticleCount} articles already processed`);

            // Step 1: Fetch latest news
            this.log('\n📰 Step 1/6: Fetching latest news from renewables.az (INCREMENTAL)...');
            this.exec('node scraper/fetch-full-articles.js', 'Fetch news');

            // Check if any new articles were found
            const afterScrapeProcessingState = tracking.loadProcessedArticles();
            const newArticlesFound = Object.keys(afterScrapeProcessingState.processedArticles).length - initialArticleCount;

            if (newArticlesFound === 0) {
                this.log('\n⏭️  No new articles found. Skipping further processing.');
                this.log('✅ Already up to date!');
                const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
                this.log(`\n📊 Summary:`);
                this.log(`   - New articles: 0`);
                this.log(`   - Total articles: ${this.getArticleCount()}`);
                this.log(`   - Duration: ${duration}s`);
                this.log(`   - Status: No commit needed`);
                return; // EXIT EARLY - no new content
            }

            this.log(`\n✨ Found ${newArticlesFound} NEW articles! Continuing with processing...`);

            // Step 2: Translate articles
            this.log('\n🌍 Step 2/6: Translating articles to EN and RU (INCREMENTAL)...');
            this.exec('node automation/translate-articles.js', 'Translate articles');

            // Step 3: Generate article pages
            this.log('\n📄 Step 3/6: Generating article pages (INCREMENTAL)...');
            this.exec('node automation/generate-multilang-pages.js', 'Generate pages');

            // Step 4: Update sitemap
            this.log('\n🗺️  Step 4/6: Updating sitemap with multilang URLs...');
            this.exec('node automation/update-seo.js', 'Update SEO');

            // Step 5: Git commit
            this.log('\n📦 Step 5/6: Committing changes to Git...');
            const articleCount = this.getArticleCount();
            const commitMessage = `chore: Automated news update - ${newArticlesFound} NEW articles (${articleCount} total)

- Fetched latest news from renewables.az
- Generated multilingual pages (AZ/EN/RU)
- Updated sitemap and SEO metadata
- Incremental processing: ${newArticlesFound} new articles
- Automated update: ${new Date().toISOString()}`;

            this.exec('git add news/ news-data.json news-data-multilang.json sitemap.xml', 'Stage files');

            try {
                this.exec(`git commit -m "${commitMessage}"`, 'Commit changes');
            } catch (error) {
                if (error.message.includes('nothing to commit')) {
                    this.log('⚠️  No file changes detected (metadata only)', 'WARN');
                } else {
                    throw error;
                }
            }

            // Step 6: Push to Git
            this.log('\n🚀 Step 6/6: Pushing to Git...');
            this.exec('git push', 'Push to remote');

            // Success summary
            const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
            this.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.log('✅ SUCCESS! News update complete!');
            this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.log(`\n📊 Summary:`);
            this.log(`   - New articles: ${newArticlesFound}`);
            this.log(`   - Total articles: ${articleCount}`);
            this.log(`   - Languages: AZ, EN, RU`);
            this.log(`   - Duration: ${duration}s`);
            this.log(`   - Log: ${LOG_FILE}`);
            this.log(`\n🔗 View at: https://plugin.az/renewable-news`);

        } catch (error) {
            this.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.log('❌ UPDATE FAILED!', 'ERROR');
            this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.log(`\nErrors encountered: ${this.errors.length}`);
            this.errors.forEach((err, i) => this.log(`  ${i + 1}. ${err}`, 'ERROR'));
            this.log(`\n📋 Full log: ${LOG_FILE}`);
            process.exit(1);
        }
    }

    getArticleCount() {
        try {
            const newsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../news-data.json'), 'utf-8'));
            return newsData.articles?.length || 0;
        } catch {
            return 0;
        }
    }
}

// Run the orchestrator
if (require.main === module) {
    const orchestrator = new NewsUpdateOrchestrator();
    orchestrator.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = NewsUpdateOrchestrator;
