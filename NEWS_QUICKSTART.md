# 🚀 Renewable News - Quick Start Guide

## Access the News Page
```
file:///Users/user/Desktop/CECSO/renewable-news.html
```
Or after deployment: `https://plugin.az/renewable-news`

---

## 🔄 How It Works (Dynamic Updates!)

**Automatic fresh news on every page load:**

1. **User visits page** → `/renewable-news.html`
2. **Page calls API** → `/api/fetch-news`
3. **API scrapes renewables.az** → Fetches latest articles
4. **Results cached for 1 hour** → Fast subsequent loads
5. **Fallback to static JSON** → If API fails

**Benefits:**
✨ Always up-to-date (no manual updates needed!)  
✨ 1-hour cache prevents rate limiting  
✨ Graceful fallback to static file  
✨ Works both locally and on Vercel  

---

## Manual Update (Optional)

If you want to update the static fallback file:
```bash
cd /Users/user/Desktop/CECSO/scraper
./update-news.sh
```

*Note: This is now optional since API auto-fetches!*

---

## What You Have Now

📰 **164 articles** from renewables.az  
🏷️ **6 categories**: Azerbaijan, Region, World, Solar, Wind, Hydro  
🌐 **3 languages**: English, Azerbaijani, Russian  
🔍 **Search + Filter**: Find any article instantly  
🌙 **Dark/Light mode**: Matches your site theme  
📱 **Responsive**: Works on all devices  
✅ **Attribution**: All links go to renewables.az  

---

## Files Overview

| File | Purpose | Size |
|------|---------|------|
| `renewable-news.html` | News display page | 24 KB |
| `news-data.json` | Article database | 71 KB |
| `scraper/fetch-news.js` | News scraper | ~4 KB |
| `scraper/update-news.sh` | Update script | ~1 KB |

---

## Next Actions

1. ✅ **Test locally**: Open `renewable-news.html` in browser
2. ✅ **Deploy**: Push to Vercel (news-data.json will be served statically)
3. ✅ **Schedule updates**: Set up daily cron job or Vercel Cron
4. ✅ **Monitor**: Check weekly that scraper still works

---

## Permission Confirmed ✅

Email from renewables.az (07.01.2026):
> *"Əlbəttə, saytın adını qeyd etməklə və ya istinad, API imkanlarından istifadə edərək xəbərləri platformanızda paylaşa bilərsiniz."*

Translation: *"Of course, you can share news on your platform by mentioning the site name or using reference/API capabilities."*

---

## Support

- **Documentation**: See `NEWS_INTEGRATION_GUIDE.md`
- **Scraper docs**: See `scraper/README.md`
- **Full summary**: See `NEWS_FEATURE_SUMMARY.md`

---

**Status: ✅ COMPLETE & READY FOR DEPLOYMENT**

*Last updated: January 7, 2026*
