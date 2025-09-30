const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://postgres:Redux@123@db.ucvqatodzyskmooqahun.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database migration...\n');

    // Add missing columns to complaints table
    console.log('📝 Adding missing columns to complaints table...');

    const alterQueries = [
      // Add title column if it doesn't exist
      "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS title VARCHAR(255)",

      // Add contact_method if it doesn't exist
      "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS contact_method VARCHAR(20) DEFAULT 'email'",

      // Add phone column (rename reporter_phone to phone if needed)
      "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",

      // Add location_formatted column
      "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location_formatted TEXT",

      // Add user_id column
      "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS user_id UUID",

      // Add department column
      "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS department VARCHAR(100)",

      // Add estimated_resolution_date
      "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS estimated_resolution_date DATE",

      // Update constraints and defaults
      "ALTER TABLE complaints ALTER COLUMN priority SET DEFAULT 'medium'",
      "ALTER TABLE complaints ALTER COLUMN status SET DEFAULT 'submitted'",
      "ALTER TABLE complaints ALTER COLUMN reporter_type SET DEFAULT 'anonymous'",
      "ALTER TABLE complaints ALTER COLUMN created_at SET DEFAULT NOW()",
      "ALTER TABLE complaints ALTER COLUMN updated_at SET DEFAULT NOW()"
    ];

    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log(`  ✓ ${query.substring(0, 50)}...`);
      } catch (error) {
        console.log(`  ⚠️ ${query.substring(0, 30)}... - ${error.message}`);
      }
    }

    // Update existing data to add title where missing
    console.log('\n📝 Updating existing data...');
    await client.query(`
      UPDATE complaints 
      SET title = COALESCE(title, CONCAT(category, ' - ', LEFT(description, 50)))
      WHERE title IS NULL OR title = ''
    `);
    console.log('  ✓ Added titles to existing complaints');

    // Copy reporter_phone to phone if phone is empty
    await client.query(`
      UPDATE complaints 
      SET phone = reporter_phone 
      WHERE phone IS NULL AND reporter_phone IS NOT NULL
    `);
    console.log('  ✓ Copied phone numbers');

    // Insert departments if they don't exist
    console.log('\n🏢 Inserting departments...');
    const departments = [
      ['Roads & Infrastructure', 'Handles road maintenance, potholes, and infrastructure issues', 'roads@NaiyakSetu.gov', '+91-1234567801'],
      ['Water Supply', 'Manages water supply, quality, and distribution issues', 'water@NaiyakSetu.gov', '+91-1234567802'],
      ['Electricity', 'Handles power outages, electrical faults, and billing issues', 'electricity@NaiyakSetu.gov', '+91-1234567803'],
      ['Sanitation & Waste', 'Manages garbage collection, waste disposal, and cleanliness', 'sanitation@NaiyakSetu.gov', '+91-1234567804'],
      ['Public Safety', 'Handles safety concerns, security, and emergency services', 'safety@NaiyakSetu.gov', '+91-1234567805'],
      ['Traffic & Transportation', 'Manages traffic issues, public transport, and parking', 'traffic@NaiyakSetu.gov', '+91-1234567806'],
      ['Environment', 'Handles pollution, environmental concerns, and green initiatives', 'environment@NaiyakSetu.gov', '+91-1234567807'],
      ['Health Services', 'Manages public health facilities and medical services', 'health@NaiyakSetu.gov', '+91-1234567808']
    ];

    for (const [name, description, email, phone] of departments) {
      try {
        await client.query(`
          INSERT INTO departments (name, description, contact_email, contact_phone) 
          SELECT $1, $2, $3, $4
          WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = $1)
        `, [name, description, email, phone]);
        console.log(`  ✓ ${name}`);
      } catch (error) {
        console.log(`  ⚠️ ${name} - ${error.message}`);
      }
    }

    // Create indexes for better performance
    console.log('\n📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_complaint_id ON complaints(complaint_id)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id)'
    ];

    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
        console.log(`  ✓ ${indexQuery.split(' ')[5]}`);
      } catch (error) {
        console.log(`  ⚠️ Index skipped: ${error.message}`);
      }
    }

    // Check final structure
    console.log('\n✅ Migration completed! Checking final structure...');

    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'complaints' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Final complaints table columns:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type})`);
    });

    const deptResult = await client.query('SELECT COUNT(*) as count FROM departments');
    console.log(`\n🏢 Departments: ${deptResult.rows[0].count}`);

    console.log('\n🎉 Database migration completed successfully!');
    console.log('📝 Your backend is now ready to handle complaint submissions!');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateDatabase();