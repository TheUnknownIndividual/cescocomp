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
      house_size_m2 INTEGER,
      people_count INTEGER,
      daytime_occupancy BOOLEAN,
      electric_cooking BOOLEAN,
      heavy_ac BOOLEAN,
      water_heater BOOLEAN,
      panels_needed INTEGER,
      system_size_kwp NUMERIC,
      annual_production_kwh INTEGER,
      roof_area_m2 INTEGER,
      estimated_cost_azn INTEGER,
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
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS house_size_m2 INTEGER`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS people_count INTEGER`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS daytime_occupancy BOOLEAN`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS electric_cooking BOOLEAN`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS heavy_ac BOOLEAN`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS water_heater BOOLEAN`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS ip_address TEXT`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS user_agent TEXT`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS contacted BOOLEAN NOT NULL DEFAULT FALSE`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS notes TEXT`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS region_name_az TEXT`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS region_name_en TEXT`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS annual_electricity_usage_kwh INTEGER`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS input_data JSONB`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS output_data JSONB`);
  await db.query(`ALTER TABLE solar_calculator_leads ADD COLUMN IF NOT EXISTS calculation_data JSONB`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_solar_calculator_leads_created ON solar_calculator_leads(created_at DESC)`);
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
    const inputData = body.input_data || body;
    const outputData = body.output_data || body;
    const ipAddress = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')
      .split(',')[0]
      .trim();
    const result = await db.query(
      `INSERT INTO solar_calculator_leads
       (phone_number, name, email, location_name, latitude, longitude, house_size_m2, people_count,
        daytime_occupancy, electric_cooking, heavy_ac, water_heater, panels_needed, system_size_kwp,
        annual_production_kwh, roof_area_m2, estimated_cost_azn, ip_address, user_agent, region_name_az,
        region_name_en, annual_electricity_usage_kwh, input_data, output_data, calculation_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       RETURNING id`,
      [
        phone,
        body.name || null,
        body.email || null,
        body.location_name || null,
        body.latitude ? Number(body.latitude) : null,
        body.longitude ? Number(body.longitude) : null,
        body.house_size_m2 ? Number(body.house_size_m2) : null,
        body.people_count ? Number(body.people_count) : null,
        typeof body.daytime_occupancy === 'boolean' ? body.daytime_occupancy : null,
        typeof body.electric_cooking === 'boolean' ? body.electric_cooking : null,
        typeof body.heavy_ac === 'boolean' ? body.heavy_ac : null,
        typeof body.water_heater === 'boolean' ? body.water_heater : null,
        body.panels_needed ? Number(body.panels_needed) : null,
        body.system_size_kwp ? Number(body.system_size_kwp) : null,
        body.annual_production_kwh ? Number(body.annual_production_kwh) : null,
        body.roof_area_m2 ? Number(body.roof_area_m2) : null,
        body.estimated_cost_azn ? Number(body.estimated_cost_azn) : null,
        ipAddress || null,
        req.headers['user-agent'] || null,
        body.region_name_az || null,
        body.region_name_en || null,
        body.annual_electricity_usage_kwh ? Number(body.annual_electricity_usage_kwh) : null,
        inputData,
        outputData,
        body
      ]
    );

    return res.status(200).json({ ok: true, saved: true, id: result.rows[0].id });
  } catch (error) {
    console.error('[api/solar-calculator-submit]', error.message);
    return res.status(500).json({ error: 'Failed to save calculator lead' });
  }
};
