const crypto = require('crypto');
const { Pool } = require('pg');

const LANGS = ['en', 'az', 'ru'];
const DEFAULT_LANG = 'az';
const BASE_URL = process.env.SITE_URL || 'https://plugin.az';
const DEFAULT_KEYWORDS = {
  en: 'renewable energy, solar energy, wind energy, green energy, Azerbaijan, sustainable energy',
  az: 'bərpa olunan enerji, günəş enerjisi, külək enerjisi, yaşıl enerji, Azərbaycan, davamlı enerji',
  ru: 'возобновляемая энергия, солнечная энергия, ветровая энергия, зеленая энергия, Азербайджан'
};

let pool;
let schemaReady = false;
let schemaReadyPromise = null;

function getConnectionString() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL;
}

function getPool() {
  const connectionString = getConnectionString();
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false, checkServerIdentity: () => undefined },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });
  }
  return pool;
}

async function ensureSchema(db = getPool()) {
  if (!db || schemaReady) return Boolean(db);
  if (schemaReadyPromise) return schemaReadyPromise;
  schemaReadyPromise = (async () => {
    const client = await db.connect();
    try {
      await client.query('SELECT pg_advisory_lock($1, $2)', [4212026, 2]);
      await client.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
          hero_image TEXT,
          source_type TEXT NOT NULL DEFAULT 'cms',
          published_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'`);
      await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS hero_image TEXT`);
      await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'cms'`);
      await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`);
      await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
      await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS post_translations (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
          lang TEXT NOT NULL CHECK (lang IN ('en', 'az', 'ru')),
          title TEXT NOT NULL,
          slug VARCHAR(180) NOT NULL,
          excerpt TEXT,
          markdown TEXT,
          html TEXT,
          seo_title TEXT,
          seo_description TEXT,
          seo_keywords TEXT,
          target_location TEXT,
          local_seo_title TEXT,
          local_seo_description TEXT,
          image_alt TEXT,
          UNIQUE (post_id, lang),
          UNIQUE (lang, slug)
        )
      `);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS lang TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS title TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS slug VARCHAR(180)`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS excerpt TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS markdown TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS html TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS seo_title TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS seo_description TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS seo_keywords TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS target_location TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS local_seo_title TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS local_seo_description TEXT`);
      await client.query(`ALTER TABLE post_translations ADD COLUMN IF NOT EXISTS image_alt TEXT`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_post_translations_lang_slug ON post_translations(lang, slug)`);
      schemaReady = true;
      return true;
    } finally {
      await client.query('SELECT pg_advisory_unlock($1, $2)', [4212026, 2]).catch(() => {});
      client.release();
      schemaReadyPromise = null;
    }
  })();
  return schemaReadyPromise;
}

function normalizeLang(lang) {
  return LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

function generateSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    .substring(0, 120) || crypto.randomBytes(4).toString('hex');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function safeUrl(value) {
  const url = String(value || '').trim();
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('/')) return url;
  return '#';
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function renderInline(markdown) {
  let html = escapeHtml(markdown);
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) => {
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
    return `<img src="${escapeAttr(safeUrl(src))}" alt="${escapeAttr(alt)}"${titleAttr} loading="lazy">`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    return `<a href="${escapeAttr(safeUrl(href))}" target="_blank" rel="noopener">${text}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  return html;
}

function isMarkdownTableSeparator(line) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function splitMarkdownTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function renderMarkdown(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let paragraph = [];
  let list = null;
  let table = null;

  function flushParagraph() {
    if (paragraph.length) {
      out.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  }

  function closeList() {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  }

  function closeTable() {
    if (table) {
      out.push('<div class="md-table-wrap"><table class="md-table">');
      out.push('<thead><tr>' + table.headers.map(cell => `<th>${renderInline(cell)}</th>`).join('') + '</tr></thead>');
      out.push('<tbody>');
      for (const row of table.rows) {
        out.push('<tr>' + table.headers.map((_, index) => `<td>${renderInline(row[index] || '')}</td>`).join('') + '</tr>');
      }
      out.push('</tbody></table></div>');
      table = null;
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      closeTable();
      continue;
    }

    if (line.includes('|') && lines[index + 1] && isMarkdownTableSeparator(lines[index + 1].trim())) {
      flushParagraph();
      closeList();
      closeTable();
      table = { headers: splitMarkdownTableRow(line), rows: [] };
      index += 1;
      continue;
    }

    if (table && line.includes('|')) {
      table.rows.push(splitMarkdownTableRow(line));
      continue;
    }

    closeTable();

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = Math.min(6, heading[1].length);
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      closeList();
      out.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (list !== 'ul') {
        closeList();
        out.push('<ul>');
        list = 'ul';
      }
      out.push(`<li>${renderInline(bullet[1])}</li>`);
      continue;
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      flushParagraph();
      if (list !== 'ol') {
        closeList();
        out.push('<ol>');
        list = 'ol';
      }
      out.push(`<li>${renderInline(numbered[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  closeTable();
  return out.join('\n');
}

function normalizeTranslation(input, lang) {
  const title = String(input?.title || '').trim();
  if (!title) return null;
  const slug = generateSlug(input?.slug || title);
  const markdown = String(input?.markdown || '').trim();
  const html = renderMarkdown(markdown);
  const plain = stripHtml(html || input?.excerpt || title);
  return {
    lang,
    title,
    slug,
    excerpt: String(input?.excerpt || plain.substring(0, 220)).trim(),
    markdown,
    html,
    seo_title: String(input?.seo_title || title).trim(),
    seo_description: String(input?.seo_description || plain.substring(0, 160)).trim(),
    seo_keywords: String(input?.seo_keywords || DEFAULT_KEYWORDS[lang]).trim(),
    target_location: String(input?.target_location || '').trim(),
    local_seo_title: String(input?.local_seo_title || '').trim(),
    local_seo_description: String(input?.local_seo_description || '').trim(),
    image_alt: String(input?.image_alt || title).trim()
  };
}

function normalizePostPayload(body) {
  const status = body?.status === 'published' ? 'published' : 'draft';
  const heroImage = String(body?.hero_image || '').trim();
  const translations = {};
  for (const lang of LANGS) {
    const normalized = normalizeTranslation(body?.translations?.[lang], lang);
    if (normalized) translations[lang] = normalized;
  }
  if (Object.keys(translations).length === 0) {
    throw new Error('At least one translation with a title is required');
  }
  return { status, hero_image: heroImage, translations };
}

async function listAdminPosts() {
  const db = getPool();
  if (!db) throw new Error('Database is not configured');
  await ensureSchema(db);
  const result = await db.query(`
    SELECT p.*, COALESCE(json_object_agg(t.lang, row_to_json(t)) FILTER (WHERE t.id IS NOT NULL), '{}'::json) AS translations
    FROM posts p
    LEFT JOIN post_translations t ON t.post_id = p.id
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `);
  return result.rows;
}

async function savePost(body, id) {
  const db = getPool();
  if (!db) throw new Error('Database is not configured');
  await ensureSchema(db);
  const payload = normalizePostPayload(body);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    let postId = id ? Number(id) : null;
    const publishedAtExpr = payload.status === 'published'
      ? 'COALESCE(published_at, NOW())'
      : 'published_at';

    if (postId) {
      await client.query(
        `UPDATE posts SET status=$1, hero_image=$2, published_at=${publishedAtExpr}, updated_at=NOW() WHERE id=$3`,
        [payload.status, payload.hero_image, postId]
      );
    } else {
      const created = await client.query(
        `INSERT INTO posts (status, hero_image, published_at)
         VALUES ($1, $2, CASE WHEN $1='published' THEN NOW() ELSE NULL END)
         RETURNING id`,
        [payload.status, payload.hero_image]
      );
      postId = created.rows[0].id;
    }

    for (const translation of Object.values(payload.translations)) {
      await client.query(
        `INSERT INTO post_translations
          (post_id, lang, title, slug, excerpt, markdown, html, seo_title, seo_description, seo_keywords, target_location, local_seo_title, local_seo_description, image_alt)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (post_id, lang) DO UPDATE SET
          title=EXCLUDED.title,
          slug=EXCLUDED.slug,
          excerpt=EXCLUDED.excerpt,
          markdown=EXCLUDED.markdown,
          html=EXCLUDED.html,
          seo_title=EXCLUDED.seo_title,
          seo_description=EXCLUDED.seo_description,
          seo_keywords=EXCLUDED.seo_keywords,
          target_location=EXCLUDED.target_location,
          local_seo_title=EXCLUDED.local_seo_title,
          local_seo_description=EXCLUDED.local_seo_description,
          image_alt=EXCLUDED.image_alt`,
        [
          postId,
          translation.lang,
          translation.title,
          translation.slug,
          translation.excerpt,
          translation.markdown,
          translation.html,
          translation.seo_title,
          translation.seo_description,
          translation.seo_keywords,
          translation.target_location,
          translation.local_seo_title,
          translation.local_seo_description,
          translation.image_alt
        ]
      );
    }

    await client.query('COMMIT');
    return { id: postId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function deletePost(id) {
  const db = getPool();
  if (!db) throw new Error('Database is not configured');
  await ensureSchema(db);
  await db.query('DELETE FROM posts WHERE id=$1', [Number(id)]);
}

function mapCmsFeedRow(row, lang) {
  return {
    type: 'cms',
    id: row.id,
    slug: row.slug,
    lang,
    title: row.title,
    excerpt: row.excerpt,
    image: row.hero_image || '',
    image_alt: row.image_alt || row.title,
    source: 'Blog',
    published_at: row.published_at,
    fetched_at: row.updated_at,
    link: `/${lang}/blog/${row.slug}`
  };
}

async function getPublishedCmsFeed({ lang = DEFAULT_LANG, page = 1, pageSize = 20, source = 'all' } = {}) {
  const db = getPool();
  if (!db || (source && source !== 'all' && source !== 'Blog' && source !== 'cms')) return { articles: [], total: 0 };
  await ensureSchema(db);
  const normalizedLang = normalizeLang(lang);
  const offset = (page - 1) * pageSize;
  const result = await db.query(
    `SELECT p.id, p.hero_image, p.published_at, p.updated_at,
            COALESCE(t.slug, fallback.slug) AS slug,
            COALESCE(t.title, fallback.title) AS title,
            COALESCE(t.excerpt, fallback.excerpt) AS excerpt,
            COALESCE(t.image_alt, fallback.image_alt) AS image_alt
     FROM posts p
     JOIN post_translations fallback ON fallback.post_id = p.id
     LEFT JOIN post_translations t ON t.post_id = p.id AND t.lang = $1
     WHERE p.status='published' AND fallback.lang = (
       SELECT lang FROM post_translations pt
       WHERE pt.post_id = p.id
       ORDER BY CASE WHEN pt.lang = $1 THEN 0 WHEN pt.lang = $2 THEN 1 ELSE 2 END
       LIMIT 1
     )
     ORDER BY p.published_at DESC NULLS LAST, p.updated_at DESC
     LIMIT $3 OFFSET $4`,
    [normalizedLang, DEFAULT_LANG, pageSize, offset]
  );
  const count = await db.query(`SELECT COUNT(*) FROM posts WHERE status='published'`);
  return {
    articles: result.rows.map(row => mapCmsFeedRow(row, normalizedLang)),
    total: parseInt(count.rows[0].count, 10)
  };
}

async function findCmsPostBySlug({ lang = DEFAULT_LANG, slug }) {
  const db = getPool();
  if (!db || !slug) return null;
  await ensureSchema(db);
  const normalizedLang = normalizeLang(lang);
  const result = await db.query(
    `SELECT p.id, p.status, p.hero_image, p.published_at, p.updated_at,
            t.lang, t.title, t.slug, t.excerpt, t.html, t.seo_title, t.seo_description, t.seo_keywords,
            t.target_location, t.local_seo_title, t.local_seo_description, t.image_alt
     FROM post_translations t
     JOIN posts p ON p.id = t.post_id
     WHERE p.status='published' AND t.lang=$1 AND t.slug=$2
     LIMIT 1`,
    [normalizedLang, slug]
  );
  if (!result.rows.length) return null;
  const post = result.rows[0];
  const translations = await db.query(
    `SELECT lang, slug, title FROM post_translations WHERE post_id=$1 ORDER BY lang`,
    [post.id]
  );
  post.translations = translations.rows;
  return post;
}

async function listPublishedCmsTranslations() {
  const db = getPool();
  if (!db) return [];
  await ensureSchema(db);
  const result = await db.query(
    `SELECT p.id, p.published_at, p.updated_at, t.lang, t.slug
     FROM posts p
     JOIN post_translations t ON t.post_id = p.id
     WHERE p.status='published'
     ORDER BY p.published_at DESC NULLS LAST, p.updated_at DESC`
  );
  return result.rows;
}

function signSession() {
  const secret = process.env.ADMIN_PASSWORD || '';
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  return `${timestamp}.${signature}`;
}

function verifySession(value) {
  const secret = process.env.ADMIN_PASSWORD || '';
  if (!secret || !value) return false;
  const [timestamp, signature] = String(value).split('.');
  if (!timestamp || !signature) return false;
  const age = Date.now() - Number(timestamp);
  if (!Number.isFinite(age) || age < 0 || age > 7 * 24 * 60 * 60 * 1000) return false;
  const expected = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

module.exports = {
  BASE_URL,
  DEFAULT_KEYWORDS,
  LANGS,
  DEFAULT_LANG,
  deletePost,
  ensureSchema,
  escapeHtml,
  findCmsPostBySlug,
  generateSlug,
  getPool,
  getPublishedCmsFeed,
  listAdminPosts,
  listPublishedCmsTranslations,
  normalizeLang,
  renderMarkdown,
  savePost,
  signSession,
  stripHtml,
  verifySession
};
