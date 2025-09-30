const { Pool } = require("pg");
require("dotenv").config();

console.log("🔧 Testing Supabase connection with new credentials...");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "NOT SET");

async function testConnection() {
  const testConfigs = [
    {
      name: "Individual params with SSL",
      config: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: "Connection string",
      config: {
        connectionString: process.env.DB_URL,
        ssl: { rejectUnauthorized: false }
      }
    }
  ];

  for (const testConfig of testConfigs) {
    console.log(`\n🔧 Testing: ${testConfig.name}`);
    
    const pool = new Pool({
      ...testConfig.config,
      max: 1,
      connectionTimeoutMillis: 10000
    });

    try {
      const client = await pool.connect();
      console.log(`✅ ${testConfig.name} connection successful!`);
      
      // Test a simple query
      const result = await client.query('SELECT version()');
      console.log(`✅ Query successful! PostgreSQL version: ${result.rows[0].version.substring(0, 50)}...`);
      
      client.release();
      await pool.end();
    } catch (error) {
      console.log(`❌ ${testConfig.name} failed:`, error.message);
    }
  }
}

testConnection().then(() => {
  console.log("\n🏁 Connection test completed");
  process.exit(0);
}).catch(console.error);