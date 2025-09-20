const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function fixOtpTable() {
  try {
    console.log('Checking otp_codes table...');
    
    // Check if attempts column exists, add if missing
    const attemptsCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'otp_codes' AND column_name = 'attempts'
    `);
    
    if (attemptsCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE otp_codes 
        ADD COLUMN attempts INTEGER DEFAULT 0
      `);
      console.log('✅ Added attempts column');
    } else {
      console.log('✅ attempts column already exists');
    }
    
    // Verify the final structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'otp_codes' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== otp_codes table columns ===');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixOtpTable();