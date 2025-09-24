const { Pool } = require('pg');
require('dotenv').config();

async function recreateComplaintsTable() {
    console.log('🔄 Recreating complaints table with correct structure...');
    
    const pool = new Pool({
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "civicsecure_db",
        password: process.env.DB_PASSWORD || "Koushik@123",
        port: process.env.DB_PORT || 5432,
    });

    try {
        console.log('📋 Dropping existing complaints table...');
        await pool.query('DROP TABLE IF EXISTS complaints CASCADE');
        console.log('✅ Old table dropped');

        console.log('📋 Creating new complaints table...');
        await pool.query(`
            CREATE TABLE complaints (
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
        console.log('✅ New complaints table created');

        console.log('📊 Creating indexes...');
        await pool.query('CREATE INDEX idx_complaints_complaint_id ON complaints(complaint_id)');
        await pool.query('CREATE INDEX idx_complaints_category ON complaints(category)');
        await pool.query('CREATE INDEX idx_complaints_status ON complaints(status)');
        await pool.query('CREATE INDEX idx_complaints_created_at ON complaints(created_at)');
        console.log('✅ Indexes created');

        // Verify the new structure
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'complaints' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 New table structure:');
        columns.rows.forEach(row => {
            console.log(`  ✓ ${row.column_name}: ${row.data_type}`);
        });

        await pool.end();
        console.log('\n🎉 Complaints table recreated successfully!');

    } catch (error) {
        console.error('❌ Error recreating table:', error.message);
        await pool.end();
        process.exit(1);
    }
}

recreateComplaintsTable();