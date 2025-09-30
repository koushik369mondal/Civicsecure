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
    
    // Split the schema into individual statements
    const statements = schemaSql
      .split(";")
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith("--"));

    console.log(`🔨 Executing ${statements.length} schema statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement + ";");
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error) {
          if (error.message.includes("already exists")) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} - Object already exists (skipping)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            console.log("Statement:", statement.substring(0, 100) + "...");
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

    client.release();
    await pool.end();
    console.log("\n🎉 Schema creation completed successfully!");
    
  } catch (error) {
    console.error("❌ Error creating schema:", error.message);
    process.exit(1);
  }
}

createSchema();