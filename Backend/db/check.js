const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://postgres:Redux@123@db.ucvqatodzyskmooqahun.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database structure...\n');
    
    // Check all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    console.log('\n📋 Complaints table structure:');
    const complaintsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'complaints'
      ORDER BY ordinal_position
    `);
    
    complaintsColumns.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check departments count
    try {
      const deptResult = await client.query('SELECT COUNT(*) as count FROM departments');
      console.log(`\n🏢 Departments count: ${deptResult.rows[0].count}`);
    } catch (error) {
      console.log(`\n🏢 Departments table issue: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDatabase();