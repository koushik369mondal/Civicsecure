const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "civicsecure_db",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  acquireTimeoutMillis: 60000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Cleanup expired OTPs periodically
const cleanupExpiredOTPs = async () => {
  try {
    const result = await pool.query(
      'DELETE FROM otp_codes WHERE otp_expiry < NOW()'
    );
    if (result.rowCount > 0) {
      console.log(`🧹 Cleaned up ${result.rowCount} expired OTP(s)`);
    }
  } catch (error) {
    console.error('Error cleaning expired OTPs:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredOTPs, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, gracefully shutting down...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

module.exports = pool;
