const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "civicsecure_db",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
});

async function checkDatabaseSchema() {
    console.log('Checking database schema...');
    
    try {
        // Test connection
        const client = await pool.connect();
        console.log('✅ Database connection successful');
        
        // Check if complaints table exists
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'complaints'
            );
        `);
        
        console.log('Complaints table exists:', tableExists.rows[0].exists);
        
        if (tableExists.rows[0].exists) {
            // Get table schema
            const schema = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'complaints'
                ORDER BY ordinal_position;
            `);
            
            console.log('\nComplaints table schema:');
            schema.rows.forEach(row => {
                console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
            });
            
            // Test a simple insert to see what fails
            console.log('\nTesting a simple insert...');
            try {
                const testResult = await client.query(`
                    INSERT INTO complaints (
                        complaint_id, title, category, description, priority, status, 
                        reporter_type, contact_method, phone,
                        location_address, location_latitude, location_longitude, location_formatted,
                        user_id, department, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()) 
                    RETURNING id, complaint_id, created_at
                `, [
                    'TEST-123',
                    'Test Title',
                    'Test Category',
                    'Test Description',
                    'medium',
                    'submitted',
                    'anonymous',
                    'email',
                    '9876543210',
                    'Test Address',
                    26.1445,
                    91.7362,
                    'Test Formatted Address',
                    null,
                    'Test Category'
                ]);
                
                console.log('✅ Test insert successful:', testResult.rows[0]);
                
                // Clean up test data
                await client.query('DELETE FROM complaints WHERE complaint_id = $1', ['TEST-123']);
                console.log('Test data cleaned up');
                
            } catch (insertError) {
                console.log('❌ Test insert failed:');
                console.log('Error:', insertError.message);
                console.log('Detail:', insertError.detail);
                console.log('Code:', insertError.code);
            }
        }
        
        client.release();
    } catch (error) {
        console.log('❌ Database check failed:');
        console.log('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabaseSchema();