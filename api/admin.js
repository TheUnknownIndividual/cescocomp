const {
  BASE_URL,
  deletePost,
  ensureSchema,
  generateSlug,
  getPool,
  listAdminPosts,
  listPublishedCmsTranslations,
  savePost,
  signSession,
  verifySession
} = require('../lib/cms');

const COOKIE_NAME = 'cesarec_admin';
let leadSchemaReady = false;
let leadSchemaPromise = null;

function parseCookies(header) {
  return String(header || '').split(';').reduce((acc, part) => {
    const index = part.indexOf('=');
    if (index === -1) return acc;
    acc[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    return acc;
  }, {});
}

function json(res, status, body) {
  return res.status(status).json(body);
}

function publicError(error) {
  if (error && error.code === '28P01') {
    return {
      status: 503,
      body: {
        error: 'Database authentication failed. Check DATABASE_URL or POSTGRES_URL and sign in again after it is fixed.',
        code: 'DB_AUTH_FAILED',
        relogin: true
      }
    };
  }
  if (/password authentication failed/i.test(error?.message || '')) {
    return {
      status: 503,
      body: {
        error: 'Database authentication failed. Check DATABASE_URL/POSTGRES_URL and sign in again after it is fixed.',
        code: 'DB_AUTH_FAILED',
        relogin: true
      }
    };
  }
  const status = /required|translation|duplicate|unique/i.test(error?.message || '') ? 400 : 500;
  return { status, body: { error: error.message } };
}

function setSessionCookie(res, value) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function getBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function routeParts(req) {
  if (req.query && req.query.path) {
    const value = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    return String(value).replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  }
  const url = new URL(req.url || '/api/admin', 'http://localhost');
  const path = url.pathname.replace(/^\/api\/admin\/?/, '').replace(/^\/+|\/+$/g, '');
  return path ? path.split('/') : [];
}

function isAuthed(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifySession(cookies[COOKIE_NAME]);
}

async function ensureLeadSchema(db) {
  if (leadSchemaReady) return;
  if (leadSchemaPromise) return leadSchemaPromise;
  leadSchemaPromise = (async () => {
    const client = await db.connect();
    try {
      await client.query('SELECT pg_advisory_lock($1, $2)', [4212026, 1]);
      await client.query(`
        CREATE TABLE IF NOT EXISTS solar_calculator_leads (
          id SERIAL PRIMARY KEY,
          phone_number TEXT NOT NULL,
          name TEXT,
          email TEXT,
          location_name TEXT,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          panels_needed INTEGER,
          system_size_kwp NUMERIC,
          annual_production_kwh INTEGER,
          roof_area_m2 INTEGER,
          estimated_cost_azn INTEGER,
          house_size_m2 INTEGER,
          people_count INTEGER,
          daytime_occupancy BOOLEAN,
          electric_cooking BOOLEAN,
          heavy_ac BOOLEAN,
          water_heater BOOLEAN,
          ip_address TEXT,
          user_agent TEXT,
          contacted BOOLEAN NOT NULL DEFAULT FALSE,
          notes TEXT,
          region_name_az TEXT,
          region_name_en TEXT,
          annual_electricity_usage_kwh INTEGER,
          input_data JSONB,
          output_data JSONB,
          calculation_data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS house_size_m2 INTEGER`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS people_count INTEGER`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS daytime_occupancy BOOLEAN`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS electric_cooking BOOLEAN`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS heavy_ac BOOLEAN`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS water_heater BOOLEAN`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS ip_address TEXT`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS user_agent TEXT`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS contacted BOOLEAN NOT NULL DEFAULT FALSE`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS notes TEXT`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS region_name_az TEXT`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS region_name_en TEXT`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS annual_electricity_usage_kwh INTEGER`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS input_data JSONB`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS output_data JSONB`);
      await client.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS calculation_data JSONB`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_solar_calculator_leads_created ON solar_calculator_leads(created_at DESC)`);
      leadSchemaReady = true;
    } finally {
      await client.query('SELECT pg_advisory_unlock($1, $2)', [4212026, 1]).catch(() => {});
      client.release();
      leadSchemaPromise = null;
    }
  })();
  return leadSchemaPromise;
}

async function listLeads(db) {
  await ensureLeadSchema(db);
  const result = await db.query(`
    SELECT id, phone_number, name, email, location_name, latitude, longitude, panels_needed,
           system_size_kwp, annual_production_kwh, roof_area_m2, estimated_cost_azn,
           house_size_m2, people_count, daytime_occupancy, electric_cooking, heavy_ac,
           water_heater, ip_address, user_agent, contacted, notes, region_name_az,
           region_name_en, annual_electricity_usage_kwh, input_data, output_data,
           calculation_data, created_at
    FROM solar_calculator_leads
    ORDER BY created_at DESC
    LIMIT 1000
  `);
  return result.rows;
}

async function getAnalytics(db) {
  await ensureLeadSchema(db);
  const [leadTotals, postTotals, recentLocations] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*)::int AS total_leads,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS leads_7d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS leads_30d,
        COALESCE(ROUND(AVG(system_size_kwp)::numeric, 2), 0) AS avg_system_size_kwp,
        COALESCE(SUM(estimated_cost_azn)::int, 0) AS total_estimated_cost_azn
      FROM solar_calculator_leads
    `),
    db.query(`
      SELECT
        COUNT(*)::int AS total_posts,
        COUNT(*) FILTER (WHERE status='published')::int AS published_posts,
        COUNT(*) FILTER (WHERE status='draft')::int AS draft_posts
      FROM posts
    `),
    db.query(`
      SELECT COALESCE(location_name, 'Unknown') AS location_name, COUNT(*)::int AS count
      FROM solar_calculator_leads
      GROUP BY COALESCE(location_name, 'Unknown')
      ORDER BY count DESC, location_name ASC
      LIMIT 10
    `)
  ]);
  return {
    leads: leadTotals.rows[0],
    posts: postTotals.rows[0],
    top_locations: recentLocations.rows
  };
}

async function collectIndexNowUrls(db) {
  const base = BASE_URL.replace(/\/+$/, '');
  const urls = [
    `${base}/`,
    `${base}/news`,
    `${base}/projects`,
    `${base}/solar-calculator`,
    `${base}/regulatory-framework`
  ];

  const cmsTranslations = await listPublishedCmsTranslations();
  for (const post of cmsTranslations) {
    urls.push(`${base}/${post.lang}/blog/${post.slug}`);
  }

  try {
    const articles = await db.query('SELECT title FROM articles ORDER BY fetched_at DESC LIMIT 1000');
    for (const article of articles.rows) {
      urls.push(`${base}/blog/${generateSlug(article.title)}`);
    }
  } catch (error) {
    if (error.code !== '42P01') throw error;
  }

  return Array.from(new Set(urls));
}

async function submitIndexNow(db) {
  const key = process.env.INDEXNOW_KEY || '4cae280f4aa943e695a3c8782f6a6b70';
  const base = BASE_URL.replace(/\/+$/, '');
  const host = new URL(base).host;
  const urlList = await collectIndexNowUrls(db);
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${base}/${key}.txt`,
      urlList
    })
  });
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    submitted: urlList.length,
    keyLocation: `${base}/${key}.txt`,
    response: text
  };
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const parts = routeParts(req);

  try {
    if (parts[0] === 'login' && req.method === 'POST') {
      const body = await getBody(req);
      if (!process.env.ADMIN_PASSWORD) {
        return json(res, 503, { error: 'ADMIN_PASSWORD is not configured' });
      }
      if (body.password !== process.env.ADMIN_PASSWORD) {
        return json(res, 401, { error: 'Invalid password' });
      }
      setSessionCookie(res, signSession());
      return json(res, 200, { ok: true });
    }

    if (parts[0] === 'logout' && req.method === 'POST') {
      clearSessionCookie(res);
      return json(res, 200, { ok: true });
    }

    if (!isAuthed(req)) {
      return json(res, 401, { error: 'Unauthorized' });
    }

    if (!getPool()) {
      return json(res, 503, { error: 'Database is not configured' });
    }
    await ensureSchema();

    if (parts[0] === 'posts' && req.method === 'GET') {
      return json(res, 200, { posts: await listAdminPosts() });
    }

    if (parts[0] === 'leads' && req.method === 'GET') {
      return json(res, 200, { leads: await listLeads(getPool()) });
    }

    if (parts[0] === 'analytics' && req.method === 'GET') {
      return json(res, 200, { analytics: await getAnalytics(getPool()) });
    }

    if (parts[0] === 'indexnow' && req.method === 'POST') {
      const result = await submitIndexNow(getPool());
      return json(res, result.ok ? 200 : 502, result);
    }

    if (parts[0] === 'posts' && req.method === 'POST' && parts.length === 1) {
      const body = await getBody(req);
      return json(res, 200, await savePost(body));
    }

    if (parts[0] === 'posts' && req.method === 'PUT' && parts[1]) {
      const body = await getBody(req);
      return json(res, 200, await savePost(body, parts[1]));
    }

    if (parts[0] === 'posts' && req.method === 'DELETE' && parts[1]) {
      await deletePost(parts[1]);
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { error: 'Not found' });
  } catch (error) {
    const { status, body } = publicError(error);
    if (body.relogin) clearSessionCookie(res);
    return json(res, status, body);
  }
}

module.exports = handler;
