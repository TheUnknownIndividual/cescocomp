// Database update script to add slug column and populate it
// Run this once to optimize article lookups

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    .substring(0, 100);
}

async function updateDatabase() {
  console.log('🔧 Updating database schema...');
  
  try {
    // Add slug column if it doesn't exist
    await pool.query(`
      ALTER TABLE articles 
      ADD COLUMN IF NOT EXISTS slug VARCHAR(150) UNIQUE
    `);
    console.log('✅ Added slug column');

    // Get all articles without slugs
    const result = await pool.query(
      'SELECT id, title FROM articles WHERE slug IS NULL OR slug = \'\''
    );
    
    console.log(`📝 Updating slugs for ${result.rows.length} articles...`);
    
    for (const article of result.rows) {
      const slug = generateSlug(article.title);
      
      try {
        await pool.query(
          'UPDATE articles SET slug = $1 WHERE id = $2',
          [slug, article.id]
        );
        console.log(`  ✓ ${article.id}: ${slug}`);
      } catch (e) {
        if (e.code === '23505') { // Unique constraint violation
          const uniqueSlug = `${slug}-${article.id}`;
          await pool.query(
            'UPDATE articles SET slug = $1 WHERE id = $2',
            [uniqueSlug, article.id]
          );
          console.log(`  ✓ ${article.id}: ${uniqueSlug} (duplicate resolved)`);
        } else {
          console.error(`  ❌ ${article.id}: ${e.message}`);
        }
      }
    }

    // Create index for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)
    `);
    console.log('✅ Created slug index');

    console.log('\n🎉 Database update completed successfully!');
    console.log('   - Added slug column');
    console.log(`   - Updated ${result.rows.length} article slugs`);
    console.log('   - Created search index');
    
  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  updateDatabase();
}

module.exports = { updateDatabase, generateSlug };