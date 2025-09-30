const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function createSchema() {
  console.log("🔧 Creating database schema...");
  
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

    // Read the schema file
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    
    console.log("📄 Reading schema.sql file...");
    
    // Execute the entire schema as one statement
    try {
      await client.query(schemaSql);
      console.log("✅ Schema executed successfully");
    } catch (error) {
      console.error("❌ Error executing schema:", error.message);
      
      // If that fails, try executing in smaller chunks
      console.log("🔄 Trying to execute schema in smaller chunks...");
      
      // Split on double newlines to separate logical blocks
      const blocks = schemaSql.split('\n\n').filter(block => 
        block.trim() && 
        !block.trim().startsWith('--') && 
        block.trim().length > 10
      );
      
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i].trim();
        if (block) {
          try {
            await client.query(block);
            console.log(`✅ Block ${i + 1}/${blocks.length} executed successfully`);
          } catch (blockError) {
            if (blockError.message.includes("already exists")) {
              console.log(`⚠️  Block ${i + 1}/${blocks.length} - Object already exists (skipping)`);
            } else {
              console.error(`❌ Error in block ${i + 1}:`, blockError.message);
              console.log("Block content:", block.substring(0, 100) + "...");
            }
          }
        }
      }
    }

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log("\n📋 Tables created:");
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    // Check if we have departments data
    try {
      const deptCount = await client.query('SELECT COUNT(*) FROM departments');
      console.log(`\n📊 Departments in database: ${deptCount.rows[0].count}`);
    } catch (error) {
      console.log("⚠️  Could not check departments table");
    }

    client.release();
    await pool.end();
    console.log("\n🎉 Schema creation completed successfully!");
    
  } catch (error) {
    console.error("❌ Error creating schema:", error.message);
    process.exit(1);
  }
}

createSchema();