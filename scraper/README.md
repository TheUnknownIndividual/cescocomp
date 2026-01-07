# Renewables.az News Scraper

This Node.js script fetches renewable energy news from renewables.az and saves them in structured JSON format.

## Features

- Scrapes news from multiple categories:
  - Azərbaycan (Azerbaijan)
  - Region
  - Dünya (World)
  - Günəş (Solar)
  - Külək (Wind)
  - Hidro (Hydro)

- Extracts:
  - Article title
  - Publication date
  - Featured image
  - Article link
  - Category

- Automatically removes duplicates
- Saves to `news-data.json` in parent directory

## Usage

```bash
node fetch-news.js
```

## Output

Creates `/news-data.json` with structure:

```json
{
  "lastUpdated": "2026-01-07T11:26:48.786Z",
  "totalArticles": 164,
  "articles": [
    {
      "title": "Article title",
      "date": "07.01.2026 14:35",
      "image": "https://renewables.az/storage/...",
      "link": "https://renewables.az/az/news/...",
      "source": "renewables.az",
      "category": "Azərbaycan"
    }
  ]
}
```

## Requirements

- Node.js (built-in `https` and `fs` modules)
- No external dependencies needed

## Attribution

All news content is sourced from [renewables.az](https://renewables.az) with proper attribution and links to original articles.
