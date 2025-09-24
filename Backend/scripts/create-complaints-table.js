const { Pool } = require('pg');
require('dotenv').config();

async function createComplaintsTable() {
    console.log('🔄 Creating complaints table...');
    
    const pool = new Pool({
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "civicsecure_db",
        password: process.env.DB_PASSWORD || "Koushik@123",
        port: process.env.DB_PORT || 5432,
    });

    try {
        // Create complaints table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                id SERIAL PRIMARY KEY,
                complaint_id VARCHAR(20) UNIQUE NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                location_address TEXT,
                location_latitude DECIMAL(10, 8),
                location_longitude DECIMAL(11, 8),
                reporter_type VARCHAR(20) NOT NULL DEFAULT 'anonymous',
                reporter_phone VARCHAR(15),
                reporter_name VARCHAR(100),
                aadhaar_number VARCHAR(12),
                aadhaar_verified BOOLEAN DEFAULT false,
                status VARCHAR(20) DEFAULT 'pending',
                priority VARCHAR(10) DEFAULT 'medium',
                assigned_to VARCHAR(100),
                attachments JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP,
                resolution_notes TEXT
            )
        `);
        console.log('✅ Complaints table created');

        // Create indexes (with error handling)
        console.log('📊 Creating indexes...');
        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id)');
            console.log('  ✅ Index on complaint_id created');
        } catch (e) {
            console.log('  ⚠️  Index on complaint_id already exists or error:', e.message);
        }

        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category)');
            console.log('  ✅ Index on category created');
        } catch (e) {
            console.log('  ⚠️  Index on category already exists or error:', e.message);
        }

        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)');
            console.log('  ✅ Index on status created');
        } catch (e) {
            console.log('  ⚠️  Index on status already exists or error:', e.message);
        }

        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_reporter_phone ON complaints(reporter_phone)');
            console.log('  ✅ Index on reporter_phone created');
        } catch (e) {
            console.log('  ⚠️  Index on reporter_phone already exists or error:', e.message);
        }

        try {
            await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at)');
            console.log('  ✅ Index on created_at created');
        } catch (e) {
            console.log('  ⚠️  Index on created_at already exists or error:', e.message);
        }

        console.log('✅ Index creation completed');

        // Check if table was created successfully
        const tableCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'complaints'
        `);
        
        if (tableCheck.rows.length > 0) {
            console.log('✅ Complaints table verified successfully');
        } else {
            console.log('❌ Complaints table was not created');
        }

        await pool.end();
        console.log('🎉 Database update completed!');

    } catch (error) {
        console.error('❌ Error creating complaints table:', error);
        await pool.end();
        process.exit(1);
    }
}

createComplaintsTable();