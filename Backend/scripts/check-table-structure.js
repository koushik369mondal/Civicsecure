const { Pool } = require('pg');
require('dotenv').config();

async function checkTableStructure() {
    console.log('🔍 Checking complaints table structure...');
    
    const pool = new Pool({
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "civicsecure_db",
        password: process.env.DB_PASSWORD || "Koushik@123",
        port: process.env.DB_PORT || 5432,
    });

    try {
        // Check if table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'complaints'
            );
        `);
        
        console.log('Table exists:', tableExists.rows[0].exists);

        if (tableExists.rows[0].exists) {
            // Get column structure
            const columns = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'complaints' 
                ORDER BY ordinal_position
            `);
            
            console.log('\nCurrent complaints table columns:');
            columns.rows.forEach(row => {
                console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
            });
        }

        await pool.end();
        console.log('\n✅ Table structure check completed');

    } catch (error) {
        console.error('❌ Error checking table:', error.message);
        await pool.end();
        process.exit(1);
    }
}

checkTableStructure();