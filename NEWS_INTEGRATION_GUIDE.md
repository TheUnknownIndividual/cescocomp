# Renewable Energy News Integration

## Overview

Plugin.az now features a dedicated **Renewable Energy News** section that aggregates and displays the latest clean energy developments from [renewables.az](https://renewables.az), with full attribution and links back to the original source.

## Features

### 📰 News Aggregation
- **164 unique articles** from 6 different categories
- Real-time scraping from renewables.az
- Automatic duplicate removal
- Preserved article metadata (title, date, image, category, link)

### 🎨 User Interface
- **Card-based layout** similar to the Regulatory Framework page
- **Category filtering**: All News, Azerbaijan, Region, World, Solar, Wind, Hydro
- **Search functionality**: Find articles by title keywords
- **Responsive design**: Works on desktop, tablet, and mobile
- **Dark/Light mode support**: Consistent with the rest of the platform

### 🌐 Multilingual Support
- **English**: Full translation
- **Azerbaijani (Azərbaycanca)**: Complete localization
- **Russian (Русский)**: All UI elements translated

### 🔗 Attribution & Ethics
- All articles link to original source on renewables.az
- Clear attribution on the page header
- "Read more →" links open in new tab
- No content is hosted locally—only metadata aggregation

## File Structure

```
/CECSO
├── renewable-news.html          # Main news page
├── news-data.json                # Aggregated news data (164 articles)
├── translations.js               # Updated with news translations
├── index.html                    # Updated navigation
└── /scraper
    ├── fetch-news.js             # Node.js scraper script
    ├── update-news.sh            # Bash script for updates
    └── README.md                 # Scraper documentation
```

## How It Works

### 1. News Scraping
The `fetch-news.js` script:
- Fetches HTML from 6 renewables.az category pages
- Parses news cards using regex patterns
- Extracts: title, date, image, link, category
- Removes duplicates based on article URL
- Sorts by date (most recent first)
- Saves to `news-data.json`

### 2. News Display
The `renewable-news.html` page:
- Loads `news-data.json` via fetch API
- Renders news cards dynamically with JavaScript
- Applies filters and search in real-time
- Handles missing images gracefully (shows 📰 emoji)

### 3. Navigation Integration
- Added "News" link to main navigation in `index.html`
- Integrated with translations system
- Consistent styling with other nav items

## Usage

### Manual Update
To refresh the news data:

```bash
cd /Users/user/Desktop/CECSO/scraper
node fetch-news.js
```

Or use the convenience script:

```bash
cd /Users/user/Desktop/CECSO/scraper
./update-news.sh
```

### Automated Updates
Set up a cron job to update news daily:

```bash
# Edit crontab
crontab -e

# Add this line (updates daily at 8 AM)
0 8 * * * cd /Users/user/Desktop/CECSO/scraper && /usr/local/bin/node fetch-news.js
```

### Vercel Deployment
For automated updates on Vercel, create a scheduled function:

1. Create `api/update-news.js`:
```javascript
const { exec } = require('child_process');

module.exports = async (req, res) => {
    exec('node scraper/fetch-news.js', (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr });
        }
        res.status(200).json({ message: 'News updated', output: stdout });
    });
};
```

2. Set up Vercel Cron in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/update-news",
    "schedule": "0 8 * * *"
  }]
}
```

## Categories

The news aggregator covers:

| Category | Azerbaijani | Description |
|----------|-------------|-------------|
| **Azerbaijan** | Azərbaycan | Domestic renewable energy news |
| **Region** | Region | Caucasus and neighboring countries |
| **World** | Dünya | Global clean energy developments |
| **Solar** | Günəş | Solar power specific news |
| **Wind** | Külək | Wind energy developments |
| **Hydro** | Hidro | Hydropower projects and updates |

## Technical Details

### Data Structure
```json
{
  "lastUpdated": "2026-01-07T11:26:48.786Z",
  "totalArticles": 164,
  "articles": [
    {
      "title": "Energetika Nazirliyində ACWA Power şirkəti ilə müzakirələr aparılıb",
      "date": "07.01.2026 14:35",
      "image": "https://renewables.az/storage/news_images/...",
      "link": "https://renewables.az/az/news/...",
      "source": "renewables.az",
      "category": "Azərbaycan"
    }
  ]
}
```

### Performance
- **Initial load**: ~2-3 seconds (164 articles)
- **Filter/Search**: Instant (client-side JavaScript)
- **Image lazy loading**: Optimized for mobile
- **File size**: news-data.json ~85KB

### Browser Compatibility
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Maintenance

### Regular Tasks
1. **Weekly**: Run `update-news.sh` to refresh articles
2. **Monthly**: Check for website structure changes in renewables.az
3. **As needed**: Update scraper regex patterns if HTML changes

### Troubleshooting

**No articles displayed:**
- Check `news-data.json` exists and is valid JSON
- Verify fetch API is not blocked by CORS
- Check browser console for JavaScript errors

**Scraper fails:**
- Verify internet connection
- Check if renewables.az is accessible
- Inspect HTML structure changes with `curl https://renewables.az/az/category/Azerbaycan/news`

**Images not loading:**
- Renewables.az might be blocking hotlinking
- Consider proxy or caching solution if needed

## Future Enhancements

Potential improvements:
- [ ] RSS feed generation for news subscriptions
- [ ] Email digest of weekly news
- [ ] AI-powered summaries of articles
- [ ] Sentiment analysis and trend detection
- [ ] Integration with social media sharing
- [ ] Comment system for community discussion
- [ ] Bookmark/favorite functionality

## Attribution & Legal

- **Content Source**: [renewables.az](https://renewables.az)
- **Permission**: Received written permission via email (07.01.2026)
- **Usage**: Content aggregation with full attribution and links
- **Compliance**: All articles redirect to original source
- **No copyright infringement**: No content is copied—only metadata with links

## Contact

For questions about the news integration:
- **Platform**: Plugin.az (CECSO)
- **Email**: [Your email]
- **Source Partner**: info@renewables.az

---

*Last Updated: January 7, 2026*
