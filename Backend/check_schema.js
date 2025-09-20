const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function checkSchema() {
  try {
    // Check otp_codes table structure
    const otpResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'otp_codes' 
      ORDER BY ordinal_position
    `);
    
    console.log('=== otp_codes table columns ===');
    otpResult.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
    // Check users table structure
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== users table columns ===');
    usersResult.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();