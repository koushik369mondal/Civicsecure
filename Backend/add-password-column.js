const { Pool } = require("pg");
require("dotenv").config();

async function addPasswordColumn() {
  console.log("🔧 Adding password column to users table...");
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10000
  });

  try {
    const client = await pool.connect();
    console.log("✅ Connected to Supabase database");

    // Add password column if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password VARCHAR(255)
      `);
      console.log("✅ Password column added successfully");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("⚠️  Password column already exists");
      } else {
        console.error("❌ Error adding password column:", error.message);
      }
    }

    // Check current table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log("\n📋 Current users table structure:");
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    });

    client.release();
    await pool.end();
    console.log("\n🎉 Database update completed successfully!");
    
  } catch (error) {
    console.error("❌ Error updating database:", error.message);
    process.exit(1);
  }
}

addPasswordColumn();