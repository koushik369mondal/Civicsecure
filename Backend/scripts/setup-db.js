const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🚀 Starting database setup...');
    
    const pool = new Pool({
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "civicsecure_db",
        password: process.env.DB_PASSWORD || "Koushik@123",
        port: process.env.DB_PORT || 5432,
    });

    try {
        // Test connection
        console.log('🔗 Testing database connection...');
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL successfully');
        client.release();

        // Create tables
        console.log('📋 Creating database tables...');
        
        // Create Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                phone VARCHAR(15) UNIQUE NOT NULL,
                name VARCHAR(100),
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Create OTP codes table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id SERIAL PRIMARY KEY,
                phone VARCHAR(15) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used BOOLEAN DEFAULT false,
                attempts INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ OTP codes table created');

        // Create Aadhaar dataset table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS aadhaar_dataset (
                id SERIAL PRIMARY KEY,
                aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
                name VARCHAR(100),
                gender VARCHAR(10),
                age INTEGER,
                state VARCHAR(50),
                district VARCHAR(50),
                pincode VARCHAR(6),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true
            )
        `);
        console.log('✅ Aadhaar dataset table created');

        // Create indexes
        console.log('📊 Creating database indexes...');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_aadhaar_number ON aadhaar_dataset(aadhaar_number)');
        console.log('✅ Database indexes created');

        // Insert sample data
        console.log('📝 Inserting sample data...');
        await pool.query(`
            INSERT INTO users (phone, name, is_verified) 
            VALUES ($1, $2, $3)
            ON CONFLICT (phone) DO NOTHING
        `, ['+919876543210', 'Test User', true]);

        await pool.query(`
            INSERT INTO aadhaar_dataset (aadhaar_number, name, gender, age, state, district, pincode)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7),
                ($8, $9, $10, $11, $12, $13, $14),
                ($15, $16, $17, $18, $19, $20, $21)
            ON CONFLICT (aadhaar_number) DO NOTHING
        `, [
            '123456789012', 'John Doe', 'Male', 25, 'Karnataka', 'Bangalore', '560001',
            '234567890123', 'Jane Smith', 'Female', 30, 'Maharashtra', 'Mumbai', '400001',
            '345678901234', 'Raj Kumar', 'Male', 35, 'Tamil Nadu', 'Chennai', '600001'
        ]);
        console.log('✅ Sample data inserted');

        // Verify tables
        console.log('🔍 Verifying database setup...');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('📋 Available tables:');
        tables.rows.forEach(table => {
            console.log(`   - ${table.table_name}`);
        });

        // Check record counts
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        const aadhaarCount = await pool.query('SELECT COUNT(*) FROM aadhaar_dataset');
        
        console.log('\n📊 Database Statistics:');
        console.log(`   Users: ${userCount.rows[0].count}`);
        console.log(`   Aadhaar records: ${aadhaarCount.rows[0].count}`);

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\nYou can now start your backend server with: npm run dev');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        console.error('\nPossible issues:');
        console.error('1. PostgreSQL is not running');
        console.error('2. Database "civicsecure_db" does not exist');
        console.error('3. Wrong database credentials');
        console.error('4. Connection refused');
        
        console.error('\n🔧 Troubleshooting steps:');
        console.error('1. Start PostgreSQL service');
        console.error('2. Create database: CREATE DATABASE civicsecure_db;');
        console.error('3. Check your .env file for correct credentials');
        
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the setup
setupDatabase();