const { Pool } = require('pg');

let pool;

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
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

async function ensureSchema(db) {
  await db.query(`
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
      calculation_data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = await getBody(req);
    const phone = String(body.phone_number || '').trim();
    if (phone.replace(/\D/g, '').length < 7) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const db = getPool();
    if (!db) {
      return res.status(200).json({ ok: true, saved: false, reason: 'Database is not configured' });
    }

    await ensureSchema(db);
    const result = await db.query(
      `INSERT INTO solar_calculator_leads
       (phone_number, name, email, location_name, latitude, longitude, panels_needed, system_size_kwp,
        annual_production_kwh, roof_area_m2, estimated_cost_azn, calculation_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [
        phone,
        body.name || null,
        body.email || null,
        body.location_name || null,
        body.latitude ? Number(body.latitude) : null,
        body.longitude ? Number(body.longitude) : null,
        body.panels_needed ? Number(body.panels_needed) : null,
        body.system_size_kwp ? Number(body.system_size_kwp) : null,
        body.annual_production_kwh ? Number(body.annual_production_kwh) : null,
        body.roof_area_m2 ? Number(body.roof_area_m2) : null,
        body.estimated_cost_azn ? Number(body.estimated_cost_azn) : null,
        body
      ]
    );

    return res.status(200).json({ ok: true, saved: true, id: result.rows[0].id });
  } catch (error) {
    console.error('[api/solar-calculator-submit]', error.message);
    return res.status(500).json({ error: 'Failed to save calculator lead' });
  }
};
