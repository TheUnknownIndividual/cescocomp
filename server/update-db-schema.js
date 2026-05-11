// Database update script to normalize article schema and populate stable slugs.
// Run this after changing DATABASE_URL / POSTGRES_URL on the VM if needed.

require('dotenv').config();
const { getPool, closePool } = require('../lib/db');
const { ensureArticlesSchema } = require('../lib/articles');

async function updateDatabase() {
  const pool = getPool();
  if (!pool) {
    console.error('DATABASE_URL or POSTGRES_URL environment variable is required');
    process.exit(1);
  }

  try {
    console.log('Updating article schema...');
    await ensureArticlesSchema(pool);
    console.log('Article schema is ready.');
  } catch (error) {
    console.error('Database update failed:', error.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

updateDatabase();
