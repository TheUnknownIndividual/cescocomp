const { getPool } = require('../lib/db');
const { getPublishedCmsFeed, normalizeLang } = require('../lib/cms');
const { listScrapedArticles } = require('../lib/articles');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(200, parseInt(req.query.pageSize, 10) || 200);
  const source = req.query.source || 'all';
  const lang = normalizeLang(req.query.lang);
  const offset = (page - 1) * pageSize;
  const db = getPool();
  const wantsCmsOnly = source === 'Blog' || source === 'cms';
  const wantsScraped = source !== 'Blog' && source !== 'cms';

  let cms = { articles: [], total: 0 };
  if (source === 'all' || wantsCmsOnly) {
    try {
      cms = await getPublishedCmsFeed({ lang, page, pageSize, source: source || 'all' });
    } catch (error) {
      console.error('[api/news] CMS feed failed:', error.message);
    }
  }

  if (wantsCmsOnly) {
    return res.status(200).json({ articles: cms.articles, total: cms.total, page, pageSize });
  }

  const scrapedLimit = source === 'all' ? Math.max(0, pageSize - cms.articles.length) : pageSize;
  const scrapedOffset = source === 'all' ? Math.max(0, offset - cms.total) : offset;
  let scraped = { articles: [], total: 0 };

  if (wantsScraped && scrapedLimit > 0) {
    scraped = await listScrapedArticles({
      db,
      source,
      offset: scrapedOffset,
      pageSize: scrapedLimit
    });
  }

  return res.status(200).json({
    articles: cms.articles.concat(scraped.articles),
    total: cms.total + scraped.total,
    page,
    pageSize
  });
};
