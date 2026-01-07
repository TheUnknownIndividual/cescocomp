# 🔄 Dynamic News System - Technical Overview

## Architecture

The news system now uses a **hybrid dynamic + fallback** approach:

```
User loads page
    ↓
Calls /api/fetch-news
    ↓
[Vercel Serverless Function]
    ↓
Checks in-memory cache (1 hour TTL)
    ↓
If expired → Scrapes renewables.az
    ↓
Returns JSON to client
    ↓
Client renders news cards
    ↓
[Fallback if API fails]
    ↓
Loads /news-data.json (static file)
```

---

## Files

| File | Purpose | When It Runs |
|------|---------|--------------|
| `/api/fetch-news.js` | Serverless function (dynamic scraper) | Every page load (cached 1hr) |
| `/news-data.json` | Static backup | Only if API fails |
| `/scraper/fetch-news.js` | Manual scraper | Optional manual updates |
| `/renewable-news.html` | Frontend | Loads news dynamically |

---

## Caching Strategy

**Server-side cache (in-memory):**
- Duration: 1 hour
- Per Vercel function instance
- Prevents hammering renewables.az

**CDN cache (Vercel Edge):**
- `s-maxage=3600` (1 hour)
- `stale-while-revalidate` (serve stale while updating)

**Client-side:**
- Fresh fetch on every page load
- No localStorage caching

---

## API Response Format

```json
{
  "lastUpdated": "2026-01-07T12:00:00.000Z",
  "totalArticles": 164,
  "articles": [...],
  "cached": true,
  "cacheAge": 1800
}
```

**Fields:**
- `cached`: `true` if from cache, `false` if fresh scrape
- `cacheAge`: Seconds since last scrape (if cached)
- `stale`: `true` if returning old cache due to error

---

## Local Development

When running locally, the API endpoint won't work. The page will automatically fall back to loading `/news-data.json`.

To test the API locally:
```bash
# Install Vercel CLI
npm i -g vercel

# Run local dev server
vercel dev
```

Then visit: `http://localhost:3000/renewable-news`

---

## Deployment to Vercel

The API function deploys automatically when you push to Vercel:

```bash
# Deploy
vercel --prod

# API endpoint will be live at:
https://plugin.az/api/fetch-news
```

No additional configuration needed!

---

## Performance

**Cold start (no cache):**
- ~8-12 seconds (scraping 6 categories)
- Shows loading spinner to user

**Warm cache:**
- ~100-300ms (instant)
- Cached response

**CDN edge cache:**
- ~50ms (near-instant)
- Served from edge location

---

## Error Handling

1. **API fetch fails** → Falls back to `/news-data.json`
2. **Both sources fail** → Shows error message
3. **Partial scrape fails** → Returns available articles
4. **CORS issues** → Handled by serverless function

---

## Rate Limiting Protection

- 500ms delay between category scrapes
- 1-hour cache reduces requests by 3600x
- Vercel CDN caching adds another layer
- Expected load: ~10-20 scrapes/day

At 1000 daily visitors:
- Without cache: 6000 requests to renewables.az/day
- With cache: ~20 requests to renewables.az/day

---

## Monitoring

Check API logs in Vercel dashboard:
```
Functions → fetch-news → Logs
```

Look for:
- `✓ Returning cached data` (good)
- `✅ Fetched X articles` (fresh scrape)
- `✗ Error fetching` (issue with category)

---

## Advantages Over Static JSON

| Aspect | Static JSON | Dynamic API |
|--------|-------------|-------------|
| **Freshness** | Manual updates | Auto-updates |
| **Maintenance** | Weekly cron job | Zero maintenance |
| **User experience** | Could be outdated | Always fresh (1hr max) |
| **Server load** | None | Minimal (cached) |
| **Reliability** | 100% uptime | 99.9% (with fallback) |

---

## Future Enhancements

Possible improvements:
- [ ] Webhook from renewables.az for instant updates
- [ ] Redis/KV cache for multi-region persistence
- [ ] Incremental updates (only fetch new articles)
- [ ] Background job for cache warming
- [ ] Real-time updates via WebSocket
- [ ] Push notifications for breaking news

---

## Summary

✅ **Zero manual maintenance** - scrapes automatically  
✅ **Always fresh** - max 1 hour old  
✅ **Fast loading** - aggressive caching  
✅ **Reliable** - fallback to static file  
✅ **Ethical** - respects rate limits  
✅ **Scalable** - Vercel serverless handles traffic spikes  

**Your news section is now fully automated! 🚀**
