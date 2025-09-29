const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "civicsecure_db",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
});

async function checkFieldConstraints() {
    console.log('Checking field constraints...');
    
    try {
        const client = await pool.connect();
        
        // Get detailed column information including length constraints
        const constraints = await client.query(`
            SELECT 
                column_name, 
                data_type, 
                character_maximum_length,
                numeric_precision,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'complaints'
            AND character_maximum_length IS NOT NULL
            ORDER BY ordinal_position;
        `);
        
        console.log('\nString field constraints:');
        constraints.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type}(${row.character_maximum_length})`);
        });
        
        // Test the current complaint ID generation
        const testComplaintId = `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        console.log(`\nTest complaint ID: "${testComplaintId}" (length: ${testComplaintId.length})`);
        
        client.release();
    } catch (error) {
        console.log('❌ Check failed:', error.message);
    } finally {
        await pool.end();
    }
}

checkFieldConstraints();