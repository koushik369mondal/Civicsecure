const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Redux@123@db.ucvqatodzyskmooqahun.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to Supabase database');
    
    // Create tables one by one
    console.log('📋 Creating tables...');
    
    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'customer',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✓ Users table');

    // 2. Departments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        head_id UUID,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✓ Departments table');

    // 3. Complaints table
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        complaint_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'submitted',
        reporter_type VARCHAR(20) DEFAULT 'anonymous',
        contact_method VARCHAR(20) DEFAULT 'email',
        phone VARCHAR(20),
        location_address TEXT,
        location_latitude DECIMAL(10, 8),
        location_longitude DECIMAL(11, 8),
        location_formatted TEXT,
        user_id UUID,
        assigned_to UUID,
        department VARCHAR(100),
        estimated_resolution_date DATE,
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✓ Complaints table');

    // 4. Complaint Aadhaar data
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_aadhaar_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        complaint_id UUID,
        aadhaar_number VARCHAR(12) NOT NULL,
        name VARCHAR(255),
        gender VARCHAR(10),
        state VARCHAR(100),
        district VARCHAR(100),
        verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✓ Complaint Aadhaar data table');

    // 5. Complaint attachments
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        complaint_id UUID,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        file_size INTEGER,
        file_path TEXT,
        url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✓ Complaint attachments table');

    // 6. Complaint status history
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        complaint_id UUID,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        changed_by UUID,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✓ Complaint status history table');

    // 7. OTP codes
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        purpose VARCHAR(50) DEFAULT 'verification',
        otp_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
        is_used BOOLEAN DEFAULT false,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✓ OTP codes table');

    // 8. Complaint comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        complaint_id UUID,
        user_id UUID,
        comment TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('  ✓ Complaint comments table');

    // Create indexes
    console.log('� Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_complaint_id ON complaints(complaint_id)',
      'CREATE INDEX IF NOT EXISTS idx_attachments_complaint_id ON complaint_attachments(complaint_id)',
      'CREATE INDEX IF NOT EXISTS idx_status_history_complaint_id ON complaint_status_history(complaint_id)',
      'CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON complaint_comments(complaint_id)',
      'CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone)',
      'CREATE INDEX IF NOT EXISTS idx_otp_expiry ON otp_codes(otp_expiry)'
    ];

    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
        console.log(`  ✓ Index created: ${indexQuery.split(' ')[5]}`);
      } catch (indexError) {
        console.log(`  ⚠️ Index creation skipped: ${indexError.message}`);
      }
    }
    console.log('  ✓ Index creation completed');

    // Insert departments
    console.log('🏢 Inserting departments...');
    const departments = [
      ['Roads & Infrastructure', 'Handles road maintenance, potholes, and infrastructure issues', 'roads@civicsecure.gov', '+91-1234567801'],
      ['Water Supply', 'Manages water supply, quality, and distribution issues', 'water@civicsecure.gov', '+91-1234567802'],
      ['Electricity', 'Handles power outages, electrical faults, and billing issues', 'electricity@civicsecure.gov', '+91-1234567803'],
      ['Sanitation & Waste', 'Manages garbage collection, waste disposal, and cleanliness', 'sanitation@civicsecure.gov', '+91-1234567804'],
      ['Public Safety', 'Handles safety concerns, security, and emergency services', 'safety@civicsecure.gov', '+91-1234567805'],
      ['Traffic & Transportation', 'Manages traffic issues, public transport, and parking', 'traffic@civicsecure.gov', '+91-1234567806'],
      ['Environment', 'Handles pollution, environmental concerns, and green initiatives', 'environment@civicsecure.gov', '+91-1234567807'],
      ['Health Services', 'Manages public health facilities and medical services', 'health@civicsecure.gov', '+91-1234567808']
    ];

    for (const [name, description, email, phone] of departments) {
      await client.query(`
        INSERT INTO departments (name, description, contact_email, contact_phone) 
        SELECT $1, $2, $3, $4
        WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = $1)
      `, [name, description, email, phone]);
    }

    console.log('✅ Database schema created successfully!');
    
    // Test the setup by checking if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('complaints', 'complaint_attachments', 'complaint_aadhaar_data', 'departments', 'users')
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    console.log('\n📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Check departments
    const deptResult = await client.query('SELECT COUNT(*) as count FROM departments');
    console.log(`\n🏢 Departments inserted: ${deptResult.rows[0].count}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 You can now submit complaints and they will be saved to the Supabase database!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('🕒 Server time:', result.rows[0].current_time);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting CivicSecure Database Setup...\n');
  
  // Test connection first
  const isConnected = await testConnection();
  if (!isConnected) {
    process.exit(1);
  }
  
  console.log('');
  await setupDatabase();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupDatabase, testConnection };