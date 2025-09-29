const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:OfrKABuLVLDJyaDyqZNLczxtdOHjgOpn@ucvqatodzyskmooqahun.supabase.co:5432/postgres'
});

async function checkSchema() {
  try {
    // Check table columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'complaints' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Complaints table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Check existing data
    const dataResult = await pool.query('SELECT * FROM complaints LIMIT 1');
    if (dataResult.rows.length > 0) {
      console.log('\n📄 Sample data:');
      console.log(dataResult.rows[0]);
    } else {
      console.log('\n⚠️  No data found in complaints table');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();