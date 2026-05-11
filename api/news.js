const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { getPublishedCmsFeed, normalizeLang } = require('../lib/cms');

// Connection pool — reused across warm invocations
let pool;
let articleColumnCache = null;
function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });
  }
  return pool;
}

async function getArticleColumns(db) {
  if (articleColumnCache) return articleColumnCache;
  try {
    const result = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'articles'
    `);
    articleColumnCache = new Set(result.rows.map(row => row.column_name));
    return articleColumnCache;
  } catch {
    return new Set();
  }
}

function articleOrderBy(columns) {
  const parts = [];
  if (columns.has('published_at')) parts.push('published_at DESC NULLS LAST');
  if (columns.has('date')) parts.push('date DESC NULLS LAST');
  if (columns.has('fetched_at')) parts.push('fetched_at DESC NULLS LAST');
  if (columns.has('id')) parts.push('id DESC');
  return parts.length ? parts.join(', ') : 'title ASC';
}

function loadStaticArticles() {
  const file = path.join(__dirname, '..', 'cecso-news.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Array.isArray(json.articles) ? json.articles : [];
}

function normalizeStaticArticle(article) {
  return {
    type: 'scraped',
    title: article.title || '',
    excerpt: article.excerpt || '',
    content: article.content || null,
    image: article.image || '',
    link: article.link || '',
    source: article.source || '',
    category: article.category || null,
    published_at: article.published_at || article.date || '',
    fetched_at: article.fetched_at || null,
    slug: '',
    lang: '',
    image_alt: article.title || ''
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(200).end();
  }

  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(200, parseInt(req.query.pageSize) || 200);
    const source   = req.query.source;
    const lang     = normalizeLang(req.query.lang);
    const offset   = (page - 1) * pageSize;
    const wantsCmsOnly = source === 'Blog' || source === 'cms';
    const db = getPool();

    if (!db) {
      if (wantsCmsOnly) {
        return res.status(200).json({ articles: [], total: 0, page, pageSize });
      }
      const hasSource = source && source !== 'all';
      const articles = loadStaticArticles()
        .map(normalizeStaticArticle)
        .filter(article => !hasSource || article.source === source);

      return res.status(200).json({
        articles: articles.slice(offset, offset + pageSize),
        total: articles.length,
        page,
        pageSize
      });
    }

    const hasSource = source && source !== 'all';
    const cms = await getPublishedCmsFeed({ lang, page, pageSize, source: source || 'all' });

    if (wantsCmsOnly) {
      return res.status(200).json({ articles: cms.articles, total: cms.total, page, pageSize });
    }

    const scrapedLimit = Math.max(0, pageSize - cms.articles.length);
    const scrapedOffset = Math.max(0, offset - cms.total);
    const includeScraped = !hasSource || (source !== 'Blog' && source !== 'cms');
    const articleColumns = includeScraped ? await getArticleColumns(db) : new Set();
    const articlesTableExists = articleColumns.size > 0;
    const canFilterSource = articleColumns.has('source');
    const useSourceFilter = hasSource && source !== 'all' && canFilterSource;
    const orderBy = articleOrderBy(articleColumns);

    let rows;
    let count;
    try {
      [rows, count] = await Promise.all([
        includeScraped && articlesTableExists && scrapedLimit > 0 ? db.query(
          useSourceFilter
            ? `SELECT * FROM articles WHERE source=$3 ORDER BY ${orderBy} LIMIT $1 OFFSET $2`
            : `SELECT * FROM articles ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
          useSourceFilter ? [scrapedLimit, scrapedOffset, source] : [scrapedLimit, scrapedOffset]
        ) : Promise.resolve({ rows: [] }),
        includeScraped && articlesTableExists ? db.query(
          useSourceFilter
            ? `SELECT COUNT(*) FROM articles WHERE source=$1`
            : `SELECT COUNT(*) FROM articles`,
          useSourceFilter ? [source] : []
        ) : Promise.resolve({ rows: [{ count: 0 }] })
      ]);
    } catch (error) {
      if (error.code !== '42P01') throw error;
      rows = { rows: [] };
      count = { rows: [{ count: 0 }] };
    }

    return res.status(200).json({
      articles: cms.articles.concat(rows.rows.map(row => ({
        ...row,
        type: 'scraped',
        image_alt: row.title || ''
      }))),
      total: cms.total + parseInt(count.rows[0].count),
      page,
      pageSize
    });
  } catch (e) {
    console.error('[api/news]', e.message);
    return res.status(500).json({ error: 'DB error: ' + e.message });
  }
};
