require('dotenv').config();
const { Pool } = require('pg');
const { ensureSchema } = require('../lib/cms');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL });

function generateSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    .substring(0, 100);
}

function shortHash(value) {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).substring(0, 6);
}

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id           SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      excerpt      TEXT,
      content      TEXT,
      image        TEXT,
      link         TEXT UNIQUE NOT NULL,
      source       TEXT,
      category     TEXT,
      slug         VARCHAR(150) UNIQUE,
      published_at TEXT,
      fetched_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug VARCHAR(150) UNIQUE`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`);
  await ensureSchema();
  console.log('[db] table ready');
}

async function upsertArticles(articles) {
  for (const a of articles) {
    const baseSlug = generateSlug(a.title);
    const slug = baseSlug ? `${baseSlug}-${shortHash(a.link)}`.substring(0, 150) : null;
    await pool.query(
      `INSERT INTO articles (title, excerpt, content, image, link, source, category, published_at, slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (link) DO NOTHING`,
      [a.title, a.excerpt, a.content || null, a.image || null, a.link, a.source, a.category || null, a.published_at || null, slug]
    );
  }
}

async function getArticles({ page = 1, pageSize = 20, source } = {}) {
  const offset = (page - 1) * pageSize;
  const hasSource = source && source !== 'all';

  const rows = await pool.query(
    hasSource
      ? `SELECT * FROM articles WHERE source = $3 ORDER BY published_at DESC NULLS LAST, fetched_at DESC LIMIT $1 OFFSET $2`
      : `SELECT * FROM articles ORDER BY published_at DESC NULLS LAST, fetched_at DESC LIMIT $1 OFFSET $2`,
    hasSource ? [pageSize, offset, source] : [pageSize, offset]
  );

  const count = await pool.query(
    hasSource
      ? `SELECT COUNT(*) FROM articles WHERE source = $1`
      : `SELECT COUNT(*) FROM articles`,
    hasSource ? [source] : []
  );

  return { articles: rows.rows, total: parseInt(count.rows[0].count) };
}

module.exports = { init, upsertArticles, getArticles, generateSlug };
