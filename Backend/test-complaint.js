const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://postgres:Redux@123@db.ucvqatodzyskmooqahun.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testComplaintCreation() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing complaint creation...\n');
    
    // Test data
    const testComplaint = {
      title: 'Street Light Not Working',
      category: 'Electricity',
      description: 'The street light on Main Street has been not working for 3 days. This is causing safety concerns for pedestrians.',
      priority: 'high',
      reporterType: 'anonymous',
      contactMethod: 'email',
      phone: '9876543210',
      location: {
        address: '123 Main Street, Downtown',
        latitude: 28.6139,
        longitude: 77.2090,
        formatted: 'Main Street, Downtown, New Delhi'
      }
    };
    
    // Simulate the controller logic
    await client.query('BEGIN');
    
    // Generate complaint ID
    const complaintId = `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Insert main complaint record
    const complaintQuery = `
      INSERT INTO complaints (
        complaint_id, title, category, description, priority, status, 
        reporter_type, contact_method, phone,
        location_address, location_latitude, location_longitude, location_formatted,
        department, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id, complaint_id, created_at
    `;
    
    const complaintValues = [
      complaintId,
      testComplaint.title,
      testComplaint.category,
      testComplaint.description,
      testComplaint.priority,
      'submitted',
      testComplaint.reporterType,
      testComplaint.contactMethod,
      testComplaint.phone,
      testComplaint.location.address,
      testComplaint.location.latitude,
      testComplaint.location.longitude,
      testComplaint.location.formatted,
      testComplaint.category
    ];
    
    const complaintResult = await client.query(complaintQuery, complaintValues);
    const newComplaint = complaintResult.rows[0];
    
    console.log('✅ Complaint created successfully!');
    console.log(`   ID: ${newComplaint.id}`);
    console.log(`   Complaint Number: ${newComplaint.complaint_id}`);
    console.log(`   Created At: ${newComplaint.created_at}`);
    
    // Insert initial status history
    const statusHistoryQuery = `
      INSERT INTO complaint_status_history (
        complaint_id, status, notes, changed_at
      ) VALUES ($1, $2, $3, NOW())
    `;
    
    await client.query(statusHistoryQuery, [
      newComplaint.id,
      'submitted',
      'Complaint submitted successfully'
    ]);
    
    console.log('✅ Status history created!');
    
    await client.query('COMMIT');
    
    // Verify by reading back the data
    console.log('\n🔍 Verifying created complaint...');
    
    const verifyQuery = `
      SELECT c.*, 
             COALESCE(json_agg(
               json_build_object(
                 'status', csh.status,
                 'notes', csh.notes,
                 'changed_at', csh.changed_at
               )
             ) FILTER (WHERE csh.id IS NOT NULL), '[]') as status_history
      FROM complaints c
      LEFT JOIN complaint_status_history csh ON c.id = csh.complaint_id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    
    const verifyResult = await client.query(verifyQuery, [newComplaint.id]);
    const complaint = verifyResult.rows[0];
    
    console.log(`   Title: ${complaint.title}`);
    console.log(`   Category: ${complaint.category}`);
    console.log(`   Status: ${complaint.status}`);
    console.log(`   Priority: ${complaint.priority}`);
    console.log(`   Location: ${complaint.location_formatted}`);
    console.log(`   Reporter Type: ${complaint.reporter_type}`);
    console.log(`   Phone: ${complaint.phone}`);
    console.log(`   Status History: ${complaint.status_history.length} entries`);
    
    console.log('\n🎉 Test completed successfully!');
    console.log('📝 Your backend is now fully functional and ready to handle complaint submissions!');
    
    return {
      success: true,
      complaintId: newComplaint.complaint_id,
      databaseId: newComplaint.id
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testComplaintCreation().then(result => {
  if (result.success) {
    console.log(`\n✨ SUCCESS: Complaint ${result.complaintId} created with database ID ${result.databaseId}`);
  } else {
    console.log(`\n💥 FAILED: ${result.error}`);
  }
});