require('dotenv').config();
const { getPool } = require('../lib/db');
const { ensureSchema } = require('../lib/cms');
const { ensureArticlesSchema, slugWithHash } = require('../lib/articles');

const pool = getPool();

function requirePool() {
  if (!pool) throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  return pool;
}

async function init() {
  const db = requirePool();
  await ensureArticlesSchema(db);
  await ensureSchema(db);
  console.log('[db] tables ready');
}

async function upsertArticles(articles) {
  const db = requirePool();
  await ensureArticlesSchema(db);
  for (const article of articles) {
    const slug = slugWithHash(article.title, article.link);
    const existing = article.link
      ? await db.query('SELECT id FROM articles WHERE link=$1 LIMIT 1', [article.link])
      : { rows: [] };
    const values = [
      article.title,
      article.excerpt,
      article.content || null,
      article.image || null,
      article.link || null,
      article.source || null,
      article.category || null,
      article.published_at || article.date || null,
      slug || null
    ];

    if (existing.rows.length) {
      await db.query(
        `UPDATE articles SET
          title=$1,
          excerpt=$2,
          content=COALESCE($3, content),
          image=COALESCE($4, image),
          link=COALESCE($5, link),
          source=COALESCE($6, source),
          category=COALESCE($7, category),
          published_at=COALESCE($8, published_at),
          slug=COALESCE(slug, $9),
          fetched_at=NOW()
         WHERE id=$10`,
        values.concat(existing.rows[0].id)
      );
    } else {
      await db.query(
        `INSERT INTO articles (title, excerpt, content, image, link, source, category, published_at, slug)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        values
      );
    }
  }
}

async function getArticles({ page = 1, pageSize = 20, source } = {}) {
  const { listScrapedArticles } = require('../lib/articles');
  return listScrapedArticles({
    db: requirePool(),
    source: source || 'all',
    offset: (page - 1) * pageSize,
    pageSize
  });
}

module.exports = { init, upsertArticles, getArticles };
