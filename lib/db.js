const { Pool } = require('pg');

let pool;

function getDatabaseUrl() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
}

function parseDatabaseUrl(rawUrl = getDatabaseUrl()) {
  if (!rawUrl) return null;
  const url = new URL(rawUrl);
  const sslMode = url.searchParams.get('sslmode') || process.env.PGSSLMODE || '';
  const channelBinding = url.searchParams.get('channel_binding');
  const host = url.hostname;
  const isNeon = /\.neon\.tech$/i.test(host) || host.includes('.neon.tech');
  const sslDisabled = sslMode === 'disable';
  const needsSsl = isNeon || Boolean(sslMode && !sslDisabled);

  const config = {
    host,
    port: url.port ? Number(url.port) : 5432,
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
  };

  if (channelBinding === 'require' || channelBinding === 'prefer') {
    config.enableChannelBinding = true;
  }

  if (sslDisabled) {
    config.ssl = false;
  } else if (needsSsl) {
    config.ssl = {
      rejectUnauthorized: isNeon || sslMode === 'verify-full'
    };
  }

  return config;
}

function getPool() {
  if (!getDatabaseUrl()) return null;
  if (!pool) {
    pool = new Pool(parseDatabaseUrl());
  }
  return pool;
}

async function closePool() {
  if (!pool) return;
  const current = pool;
  pool = null;
  await current.end();
}

module.exports = {
  closePool,
  getDatabaseUrl,
  getPool,
  parseDatabaseUrl
};
