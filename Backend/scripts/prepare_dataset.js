const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env', quiet: true });

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "civicsecure_db",
    password: process.env.DB_PASSWORD || "Koushik@123",
    port: process.env.DB_PORT || 5432,
});

// Function to create the Aadhaar table
async function createAadhaarTable() {
    console.log('📊 Creating Aadhaar table...');
    try {
        // Create table if it doesn't exist
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

        // Create index for faster searches
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aadhaar_number 
      ON aadhaar_dataset(aadhaar_number)
    `);

        console.log('✅ Aadhaar table created successfully');
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        throw error;
    }
}

// Function to import CSV data
async function importDataset(csvFilePath) {
    console.log(`📁 Reading CSV file: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
        throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    const results = [];
    let rowCount = 0;

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
                // Process each row - adjust field names based on your CSV structure
                const record = {
                    aadhaar_number: data.aadhaar_number || data.Aadhaar || data.aadhaar,
                    name: data.name || data.Name || data.full_name,
                    gender: data.gender || data.Gender,
                    age: parseInt(data.age || data.Age) || null,
                    state: data.state || data.State,
                    district: data.district || data.District,
                    pincode: data.pincode || data.Pincode || data.pin
                };

                // Only add if we have a valid Aadhaar number
                if (record.aadhaar_number && /^\d{12}$/.test(record.aadhaar_number)) {
                    results.push(record);
                }
                rowCount++;

                // Show progress every 1000 rows
                if (rowCount % 1000 === 0) {
                    console.log(`📊 Processed ${rowCount} rows...`);
                }
            })
            .on('end', async () => {
                console.log(`📊 Total rows processed: ${rowCount}`);
                console.log(`📊 Valid Aadhaar records: ${results.length}`);

                // Insert data in batches
                await insertInBatches(results);
                resolve();
            })
            .on('error', (error) => {
                console.error('❌ Error reading CSV:', error);
                reject(error);
            });
    });
}

// Function to insert data in batches (faster than one-by-one)
async function insertInBatches(records) {
    const batchSize = 500; // Insert 500 records at a time
    let inserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await insertBatch(batch);
        inserted += batch.length;
        console.log(`✅ Inserted ${inserted}/${records.length} records`);
    }
}

// Function to insert a single batch
async function insertBatch(batch) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const record of batch) {
            await client.query(`
        INSERT INTO aadhaar_dataset (aadhaar_number, name, gender, age, state, district, pincode)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (aadhaar_number) DO NOTHING
      `, [
                record.aadhaar_number,
                record.name,
                record.gender,
                record.age,
                record.state,
                record.district,
                record.pincode
            ]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Main function
async function main() {
    try {
        console.log('🚀 Starting Aadhaar dataset import...');

        // Test database connection
        const testResult = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully');

        // Create table
        await createAadhaarTable();

        // Import data
        const csvPath = './aadhaar_dataset.csv';
        await importDataset(csvPath);

        // Show final statistics
        const stats = await pool.query('SELECT COUNT(*) as total FROM aadhaar_dataset');
        console.log(`🎉 Import completed! Total records: ${stats.rows[0].total}`);

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        console.log('\n📝 Troubleshooting:');
        console.log('1. Make sure your CSV file is named "aadhaar_dataset.csv"');
        console.log('2. Check if PostgreSQL is running');
        console.log('3. Verify your .env database settings');
    } finally {
        await pool.end();
    }
}

// Run the script
main();
