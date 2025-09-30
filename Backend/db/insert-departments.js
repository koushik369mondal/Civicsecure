const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://postgres:Redux@123@db.ucvqatodzyskmooqahun.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function insertDepartments() {
  const client = await pool.connect();

  try {
    const departments = [
      ['Roads & Infrastructure', 'Handles road maintenance, potholes, and infrastructure issues', 'roads@NaiyakSetu.gov', '+91-1234567801'],
      ['Water Supply', 'Manages water supply, quality, and distribution issues', 'water@NaiyakSetu.gov', '+91-1234567802'],
      ['Electricity', 'Handles power outages, electrical faults, and billing issues', 'electricity@NaiyakSetu.gov', '+91-1234567803'],
      ['Sanitation & Waste', 'Manages garbage collection, waste disposal, and cleanliness', 'sanitation@NaiyakSetu.gov', '+91-1234567804']
    ];

    for (const [name, description, email, phone] of departments) {
      try {
        await client.query('INSERT INTO departments (name, description, contact_email, contact_phone) VALUES ($1, $2, $3, $4)', [name, description, email, phone]);
        console.log(`✓ Inserted ${name}`);
      } catch (error) {
        console.log(`⚠️ ${name}: ${error.message}`);
      }
    }

    const result = await client.query('SELECT COUNT(*) as count FROM departments');
    console.log(`\nTotal departments: ${result.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

insertDepartments();