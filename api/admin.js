const {
  deletePost,
  ensureSchema,
  getPool,
  listAdminPosts,
  savePost,
  signSession,
  verifySession
} = require('../lib/cms');

const COOKIE_NAME = 'cesarec_admin';

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
    const status = /required|translation|duplicate|unique/i.test(error.message) ? 400 : 500;
    return json(res, status, { error: error.message });
  }
}

module.exports = handler;
