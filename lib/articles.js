const fs = require('fs');
const path = require('path');
const { getPool } = require('./db');

const STATIC_NEWS_FILE = path.join(__dirname, '..', 'cecso-news.json');
const SOURCE_BY_HOST = [
  ['renewables.az', 'renewables.az'],
  ['minenergy.gov.az', 'minenergy.gov.az'],
  ['area.gov.az', 'area.gov.az']
];

let schemaReady = false;
let schemaPromise = null;
let articleColumnCache = null;

function generateArticleSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function shortHash(value) {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).substring(0, 6);
}

function slugWithHash(title, value) {
  const base = generateArticleSlug(title);
  const hash = shortHash(value || title);
  return base && hash ? `${base}-${hash}`.substring(0, 150) : base || hash;
}

function inferSource(source, link) {
  if (source) return source;
  const value = String(link || '').toLowerCase();
  const match = SOURCE_BY_HOST.find(([host]) => value.includes(host));
  return match ? match[1] : '';
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || ''));
}

function isBlank(value) {
  return value == null || String(value).trim() === '';
}

function firstText() {
  for (let i = 0; i < arguments.length; i += 1) {
    if (!isBlank(arguments[i])) return arguments[i];
  }
  return '';
}

function normalizeUrlKey(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  try {
    const url = new URL(text, 'https://plugin.az');
    url.hash = '';
    url.search = '';
    return url.href.replace(/\/$/, '').toLowerCase();
  } catch {
    return text.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
  }
}

function extractBlogSlug(value) {
  const match = String(value || '').match(/\/blog\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function loadStaticArticles() {
  try {
    const json = JSON.parse(fs.readFileSync(STATIC_NEWS_FILE, 'utf8'));
    return Array.isArray(json.articles) ? json.articles : [];
  } catch {
    return [];
  }
}

async function getArticleColumns(db = getPool()) {
  if (!db) return new Set();
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

async function ensureArticlesSchema(db = getPool()) {
  if (!db || schemaReady) return Boolean(db);
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    const client = await db.connect();
    try {
      await client.query('SELECT pg_advisory_lock($1, $2)', [4212026, 3]);
      await client.query(`
        CREATE TABLE IF NOT EXISTS articles (
          id SERIAL PRIMARY KEY,
          title TEXT,
          excerpt TEXT,
          content TEXT,
          image TEXT,
          link TEXT,
          source TEXT,
          category TEXT,
          slug VARCHAR(180),
          published_at TEXT,
          fetched_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS title TEXT`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS image TEXT`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS link TEXT`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS source TEXT`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS category TEXT`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug VARCHAR(180)`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TEXT`);
      await client.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ DEFAULT NOW()`);

      const columns = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'articles'
      `);
      const names = new Set(columns.rows.map(row => row.column_name));
      if (names.has('date')) {
        await client.query(`UPDATE articles SET published_at = date WHERE (published_at IS NULL OR published_at = '') AND date IS NOT NULL`);
      }
      await client.query(`
        UPDATE articles
        SET source = CASE
          WHEN link ILIKE '%renewables.az%' THEN 'renewables.az'
          WHEN link ILIKE '%minenergy.gov.az%' THEN 'minenergy.gov.az'
          WHEN link ILIKE '%area.gov.az%' THEN 'area.gov.az'
          ELSE source
        END
        WHERE source IS NULL OR source = ''
      `);
      await client.query(`UPDATE articles SET fetched_at = NOW() WHERE fetched_at IS NULL`);

      const missingSlugs = await client.query(`
        SELECT id, title, link
        FROM articles
        WHERE slug IS NULL OR slug = ''
        ORDER BY id ASC
        LIMIT 5000
      `);
      for (const row of missingSlugs.rows) {
        const slug = slugWithHash(row.title, row.link || row.id);
        if (!slug) continue;
        try {
          await client.query('UPDATE articles SET slug=$1 WHERE id=$2', [slug, row.id]);
        } catch (error) {
          if (error.code !== '23505') throw error;
          await client.query('UPDATE articles SET slug=$1 WHERE id=$2', [`${slug}-${row.id}`.substring(0, 180), row.id]);
        }
      }

      await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_fetched_at ON articles(fetched_at DESC)`);
      articleColumnCache = null;
      schemaReady = true;
      return true;
    } finally {
      await client.query('SELECT pg_advisory_unlock($1, $2)', [4212026, 3]).catch(() => {});
      client.release();
      schemaPromise = null;
    }
  })();
  return schemaPromise;
}

function normalizeStaticArticle(article) {
  const originalLink = article.link || '';
  const slug = article.slug || generateArticleSlug(article.title) || slugWithHash(article.title, originalLink);
  const published = article.published_at || article.date || article.fetched_at || '';
  return {
    type: 'scraped',
    id: article.id || null,
    title: article.title || '',
    excerpt: article.excerpt || '',
    content: article.content || null,
    image: article.image || '',
    link: `/blog/${slug}`,
    original_link: originalLink,
    source: inferSource(article.source, originalLink),
    category: article.category || null,
    published_at: published,
    date: published,
    fetched_at: article.fetched_at || null,
    slug,
    lang: '',
    image_alt: article.image_alt || article.title || ''
  };
}

function staticArticleKeys(article) {
  const keys = new Set();
  const titleSlug = generateArticleSlug(article.title);
  const hashedSlug = slugWithHash(article.title, article.original_link || article.link || article.title);
  const blogSlug = extractBlogSlug(article.link);
  [
    article.slug,
    titleSlug,
    hashedSlug,
    blogSlug,
    normalizeUrlKey(article.original_link),
    normalizeUrlKey(article.link)
  ].forEach(value => {
    if (!isBlank(value)) keys.add(String(value).toLowerCase());
  });
  return keys;
}

function findStaticMatchForRow(row) {
  const rowKeys = new Set();
  const originalLink = isExternalUrl(row.link) ? row.link : (row.original_link || '');
  [
    row.slug,
    extractBlogSlug(row.link),
    generateArticleSlug(row.title),
    slugWithHash(row.title, originalLink || row.link || row.id),
    normalizeUrlKey(originalLink),
    normalizeUrlKey(row.link)
  ].forEach(value => {
    if (!isBlank(value)) rowKeys.add(String(value).toLowerCase());
  });
  if (!rowKeys.size) return null;

  return loadStaticArticles()
    .map(normalizeStaticArticle)
    .find(article => {
      const articleKeys = staticArticleKeys(article);
      for (const key of rowKeys) {
        if (articleKeys.has(key)) return true;
      }
      return false;
    }) || null;
}

function normalizeDbArticle(row) {
  const staticMatch = findStaticMatchForRow(row);
  const rowHasArticleText = !isBlank(row.title) || !isBlank(row.excerpt) || !isBlank(row.content);
  const originalLink = firstText(
    isExternalUrl(row.link) ? row.link : '',
    row.original_link,
    staticMatch && staticMatch.original_link
  );
  const title = firstText(row.title, staticMatch && staticMatch.title);
  const slug = firstText(
    row.slug,
    staticMatch && staticMatch.slug,
    extractBlogSlug(row.link),
    slugWithHash(title, originalLink || row.link || row.id)
  );
  const published = firstText(
    row.date,
    rowHasArticleText ? row.published_at : '',
    staticMatch && (staticMatch.published_at || staticMatch.date),
    row.published_at,
    row.fetched_at,
    staticMatch && staticMatch.fetched_at
  );
  return {
    ...row,
    type: 'scraped',
    title,
    excerpt: firstText(row.excerpt, staticMatch && staticMatch.excerpt),
    content: firstText(row.content, staticMatch && staticMatch.content) || null,
    image: firstText(row.image, staticMatch && staticMatch.image),
    link: `/blog/${slug}`,
    original_link: originalLink,
    source: inferSource(row.source, originalLink || row.link || (staticMatch && staticMatch.source)),
    category: firstText(row.category, staticMatch && staticMatch.category) || null,
    published_at: published,
    date: published,
    fetched_at: row.fetched_at || null,
    slug,
    lang: '',
    image_alt: firstText(row.image_alt, title)
  };
}

function toDetailArticle(article) {
  if (!article) return null;
  return {
    ...article,
    link: article.original_link || (isExternalUrl(article.link) ? article.link : '#')
  };
}

function filterBySource(articles, source) {
  if (!source || source === 'all') return articles;
  return articles.filter(article => article.source === source);
}

function isRenderableArticle(article) {
  return Boolean(article && !isBlank(article.title) && !isBlank(article.slug));
}

function articleDedupeKey(article) {
  return normalizeUrlKey(article.original_link) || String(article.slug || '').toLowerCase() || String(article.title || '').toLowerCase();
}

function appendStaticSupplement(articles, source, offset, pageSize) {
  const existing = new Set(articles.map(articleDedupeKey).filter(Boolean));
  const staticArticles = filterBySource(loadStaticArticles().map(normalizeStaticArticle), source)
    .filter(isRenderableArticle);
  const supplement = [];
  for (const article of staticArticles.slice(offset)) {
    const key = articleDedupeKey(article);
    if (key && existing.has(key)) continue;
    existing.add(key);
    supplement.push(article);
    if (articles.length + supplement.length >= pageSize) break;
  }
  return articles.concat(supplement).slice(0, pageSize);
}

function staticFeed({ source, offset = 0, pageSize = 20 } = {}) {
  const articles = filterBySource(loadStaticArticles().map(normalizeStaticArticle), source)
    .filter(isRenderableArticle);
  return {
    articles: articles.slice(offset, offset + pageSize),
    total: articles.length,
    fromStatic: true
  };
}

async function listScrapedArticles({ db = getPool(), source = 'all', offset = 0, pageSize = 20 } = {}) {
  if (!db) return staticFeed({ source, offset, pageSize });
  try {
    await ensureArticlesSchema(db);
    const columns = await getArticleColumns(db);
    if (!columns.size) return staticFeed({ source, offset, pageSize });
    const useSourceFilter = source && source !== 'all' && columns.has('source');
    if (source && source !== 'all' && !columns.has('source')) {
      return staticFeed({ source, offset, pageSize });
    }
    const orderBy = articleOrderBy(columns);
    const [rows, count] = await Promise.all([
      db.query(
        useSourceFilter
          ? `SELECT * FROM articles WHERE source=$3 ORDER BY ${orderBy} LIMIT $1 OFFSET $2`
          : `SELECT * FROM articles ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
        useSourceFilter ? [pageSize, offset, source] : [pageSize, offset]
      ),
      db.query(
        useSourceFilter ? 'SELECT COUNT(*) FROM articles WHERE source=$1' : 'SELECT COUNT(*) FROM articles',
        useSourceFilter ? [source] : []
      )
    ]);
    let normalizedArticles = rows.rows.map(normalizeDbArticle).filter(isRenderableArticle);
    if (!normalizedArticles.length) return staticFeed({ source, offset, pageSize });
    if (normalizedArticles.length < pageSize) {
      normalizedArticles = appendStaticSupplement(normalizedArticles, source, offset, pageSize);
    }
    const staticTotal = filterBySource(loadStaticArticles().map(normalizeStaticArticle), source)
      .filter(isRenderableArticle).length;
    return {
      articles: normalizedArticles,
      total: Math.max(parseInt(count.rows[0].count, 10), staticTotal),
      fromStatic: false
    };
  } catch (error) {
    console.warn('[articles] DB feed failed, using static fallback:', error.message);
    return staticFeed({ source, offset, pageSize });
  }
}

async function listSitemapArticles({ db = getPool(), limit = 1000 } = {}) {
  if (!db) return loadStaticArticles().map(normalizeStaticArticle).slice(0, limit);
  try {
    await ensureArticlesSchema(db);
    const columns = await getArticleColumns(db);
    if (!columns.size) return loadStaticArticles().map(normalizeStaticArticle).slice(0, limit);
    const result = await db.query(`SELECT * FROM articles ORDER BY ${articleOrderBy(columns)} LIMIT $1`, [limit]);
    const normalizedArticles = result.rows.map(normalizeDbArticle).filter(isRenderableArticle);
    if (!normalizedArticles.length) return loadStaticArticles().map(normalizeStaticArticle).filter(isRenderableArticle).slice(0, limit);
    return appendStaticSupplement(normalizedArticles, 'all', 0, limit);
  } catch (error) {
    console.warn('[articles] DB sitemap failed, using static fallback:', error.message);
    return loadStaticArticles().map(normalizeStaticArticle).filter(isRenderableArticle).slice(0, limit);
  }
}

function findStaticArticleBySlug(slug) {
  return loadStaticArticles()
    .map(normalizeStaticArticle)
    .find(article => {
      const titleSlug = generateArticleSlug(article.title);
      const hashSlug = slugWithHash(article.title, article.original_link || article.link);
      return article.slug === slug || titleSlug === slug || hashSlug === slug || String(article.original_link || '').includes(slug);
    });
}

async function findScrapedArticleBySlug(slug, { db = getPool() } = {}) {
  if (!slug) return null;
  if (db) {
    try {
      await ensureArticlesSchema(db);
      const columns = await getArticleColumns(db);
      let rows = [];
      if (columns.has('slug')) {
        const result = await db.query('SELECT * FROM articles WHERE slug=$1 LIMIT 1', [slug]);
        rows = result.rows;
      }
      if (!rows.length && columns.has('link')) {
        const result = await db.query('SELECT * FROM articles WHERE link LIKE $1 LIMIT 1', [`%${slug}%`]);
        rows = result.rows;
      }
      if (!rows.length && columns.has('title')) {
        const result = await db.query('SELECT * FROM articles WHERE title ILIKE $1 LIMIT 20', [`%${slug.replace(/-/g, ' ')}%`]);
        rows = result.rows.filter(row => {
          const normalized = normalizeDbArticle(row);
          return normalized.slug === slug || generateArticleSlug(normalized.title) === slug;
        });
      }
      if (!rows.length) {
        const result = await db.query(`SELECT * FROM articles ORDER BY ${articleOrderBy(columns)} LIMIT 5000`);
        rows = result.rows.filter(row => {
          const normalized = normalizeDbArticle(row);
          return normalized.slug === slug ||
            generateArticleSlug(normalized.title) === slug ||
            slugWithHash(normalized.title, normalized.original_link || normalized.link || normalized.id) === slug ||
            String(normalized.original_link || '').includes(slug);
        });
      }
      if (rows.length) {
        const normalized = normalizeDbArticle(rows[0]);
        if (isRenderableArticle(normalized)) return toDetailArticle(normalized);
      }
    } catch (error) {
      console.warn('[articles] DB article lookup failed, using static fallback:', error.message);
    }
  }
  return toDetailArticle(findStaticArticleBySlug(slug));
}

module.exports = {
  articleOrderBy,
  ensureArticlesSchema,
  findScrapedArticleBySlug,
  generateArticleSlug,
  getArticleColumns,
  inferSource,
  listScrapedArticles,
  listSitemapArticles,
  loadStaticArticles,
  normalizeDbArticle,
  normalizeStaticArticle,
  shortHash,
  slugWithHash
};
