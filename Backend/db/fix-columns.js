const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://postgres:Redux@123@db.ucvqatodzyskmooqahun.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixColumnSizes() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing column size constraints...\n');
    
    // Alter column sizes to be more reasonable
    const alterQueries = [
      "ALTER TABLE complaints ALTER COLUMN reporter_type TYPE VARCHAR(50)",
      "ALTER TABLE complaints ALTER COLUMN contact_method TYPE VARCHAR(50)", 
      "ALTER TABLE complaints ALTER COLUMN phone TYPE VARCHAR(30)",
      "ALTER TABLE complaints ALTER COLUMN priority TYPE VARCHAR(30)",
      "ALTER TABLE complaints ALTER COLUMN status TYPE VARCHAR(50)",
      "ALTER TABLE complaints ALTER COLUMN department TYPE VARCHAR(200)"
    ];
    
    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log(`✅ ${query}`);
      } catch (error) {
        console.log(`⚠️  ${query} - ${error.message}`);
      }
    }
    
    console.log('\n✅ Column size fixes completed!');
    
  } catch (error) {
    console.error('❌ Error fixing column sizes:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixColumnSizes();