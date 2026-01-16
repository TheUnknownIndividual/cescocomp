# Testing the Automated News Update System

## Quick Test (Manual Run)

### Test the Full Workflow

```bash
cd /Users/user/Desktop/CECSO
node automation/daily-news-update.js
```

This will:
1. Fetch latest news from renewables.az
2. Translate to EN and RU
3. Generate multilingual pages
4. Update sitemap
5. Commit and push to Git

### Test Individual Components

```bash
# 1. Test news fetching only
node scraper/fetch-full-articles.js

# 2. Test translation only
node automation/translate-articles.js

# 3. Test page generation only
node automation/generate-multilang-pages.js

# 4. Test SEO update only
node automation/update-seo.js
```

## Test GitHub Actions Workflow

### Option 1: Manual Trigger (Recommended)

1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Daily News Update" workflow
4. Click "Run workflow" button
5. Select branch: `main`
6. Click green "Run workflow" button

### Option 2: Wait for Scheduled Run

The workflow runs automatically every day at 2:00 AM UTC (6:00 AM Azerbaijan time).

### Option 3: Test Locally with Act (GitHub Actions Simulator)

```bash
# Install act (if not already installed)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run the workflow locally
cd /Users/user/Desktop/CECSO
act workflow_dispatch -W .github/workflows/daily-news-update.yml
```

## Verify Results

### Check GitHub

1. **Commits**: Look for automated commit from "GitHub Actions Bot"
2. **Actions Tab**: Check workflow run status (green = success)
3. **Logs**: Click on workflow run to see detailed logs

### Check Website

1. **Main Page**: https://plugin.az/renewable-news
2. **Azerbaijani**: https://plugin.az/news/az/{article-slug}
3. **English**: https://plugin.az/news/en/{article-slug}
4. **Russian**: https://plugin.az/news/ru/{article-slug}
5. **Sitemap**: https://plugin.az/sitemap.xml

### Check Logs

```bash
# View latest log
ls -lt automation/logs/ | head -5

# Read latest log
cat automation/logs/update-$(date +%Y-%m-%d).log

# Check for errors
grep -i error automation/logs/*.log
```

## Troubleshooting

### GitHub Actions Fails

**Check permissions:**
- Go to repo Settings → Actions → General
- Ensure "Read and write permissions" is enabled
- Or verify `permissions: contents: write` is in workflow file

**Check logs:**
- Actions tab → Click failed run → View logs
- Look for specific error messages

### Translation Fails

**Rate limit exceeded:**
- Increase delay in `translate-articles.js` (line 10)
- Current: 500ms, try 1000ms

**API timeout:**
- Check internet connection
- Try running again (translations are cached)

### Git Push Fails

**Local server:**
```bash
# Check Git credentials
git config --list | grep user

# Test SSH connection
ssh -T git@github.com

# Or use HTTPS with token
git remote set-url origin https://YOUR_TOKEN@github.com/TheUnknownIndividual/cescocomp.git
```

**GitHub Actions:**
- Should be fixed with `permissions: contents: write`
- Check repo settings for Actions permissions

## Expected Output

### Successful Run

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PLUGIN.AZ - AUTOMATED NEWS UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📰 Step 1/6: Fetching latest news from renewables.az...
✓ Fetch news completed

🌍 Step 2/6: Translating articles to EN and RU...
✓ Translate articles completed

📄 Step 3/6: Generating article pages...
✓ Generate pages completed

🗺️  Step 4/6: Updating sitemap with multilang URLs...
✓ Update SEO completed

📦 Step 5/6: Committing changes to Git...
✓ Commit changes completed

🚀 Step 6/6: Pushing to Git...
✓ Push to remote completed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SUCCESS! News update complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
   - Articles: 158
   - Languages: AZ, EN, RU
   - Duration: 45.23s
   - Log: automation/logs/update-2026-01-16.log

🔗 View at: https://plugin.az/renewable-news
```

## Performance Benchmarks

Expected execution times:

- **News Fetching**: ~30-60 seconds (depends on network)
- **Translation**: ~2-5 minutes (158 articles × 2 languages)
- **Page Generation**: ~5-10 seconds
- **SEO Update**: ~1-2 seconds
- **Git Operations**: ~5-10 seconds

**Total**: ~3-7 minutes per run

## Monitoring

### Set Up Notifications

**GitHub Actions Email:**
1. Go to GitHub → Settings → Notifications
2. Enable "Actions" notifications
3. Choose email or web notifications

**Slack Integration (Optional):**
Add to workflow:
```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Log Rotation

Add to crontab to clean old logs:
```bash
# Clean logs older than 30 days
0 3 * * * find /Users/user/Desktop/CECSO/automation/logs -name "*.log" -mtime +30 -delete
```

## Next Steps

1. ✅ Test manual run: `node automation/daily-news-update.js`
2. ✅ Trigger GitHub Actions manually
3. ✅ Verify website updates
4. ✅ Check sitemap.xml
5. ✅ Monitor first automated run (tomorrow at 2:00 AM UTC)
