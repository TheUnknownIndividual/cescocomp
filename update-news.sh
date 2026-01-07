#!/bin/bash

# Automated News Update Workflow
# Fetches latest news, generates pages, updates sitemap, and commits to Git

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PLUGIN.AZ - AUTOMATED NEWS UPDATE WORKFLOW"
echo "  Fetches news with full content, generates SEO pages, updates sitemap"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Fetch latest news with full article content
echo "📰 Step 1/5: Fetching latest news from renewables.az..."
node scraper/fetch-full-articles.js
if [ $? -ne 0 ]; then
    echo "❌ Error fetching news. Aborting."
    exit 1
fi
echo ""

# Step 2: Generate individual article pages
echo "📄 Step 2/5: Generating individual article pages..."
node generate-news-pages.js
if [ $? -ne 0 ]; then
    echo "❌ Error generating pages. Aborting."
    exit 1
fi
echo ""

# Step 3: Update sitemap
echo "🗺️  Step 3/5: Updating sitemap.xml..."
node update-sitemap.js
if [ $? -ne 0 ]; then
    echo "❌ Error updating sitemap. Aborting."
    exit 1
fi
echo ""

# Step 4: Git commit
echo "📦 Step 4/5: Committing changes to Git..."
git add news/ news-data.json sitemap.xml
ARTICLE_COUNT=$(ls -1 news/*.html 2>/dev/null | wc -l | tr -d ' ')
git commit -m "chore: Update news articles - ${ARTICLE_COUNT} articles

- Fetched latest news from renewables.az (with permission)
- Generated ${ARTICLE_COUNT} SEO-optimized article pages
- Updated sitemap.xml with latest articles
- Full article content with proper attribution

Automated update: $(date '+%Y-%m-%d %H:%M:%S')"

if [ $? -ne 0 ]; then
    echo "⚠️  No changes to commit (news already up to date)"
else
    echo "✅ Changes committed successfully"
fi
echo ""

# Step 5: Push to Git
echo "🚀 Step 5/5: Pushing to Git..."
git push
if [ $? -ne 0 ]; then
    echo "❌ Error pushing to Git. Please push manually."
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SUCCESS! News update complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   - Articles: ${ARTICLE_COUNT}"
echo "   - Sitemap: Updated"
echo "   - Git: Committed and pushed"
echo "   - Deployment: Vercel will auto-deploy in ~2-3 minutes"
echo ""
echo "🔗 View at: https://plugin.az/renewable-news.html"
echo ""
