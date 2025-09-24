const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost", 
  database: process.env.DB_NAME || "civicsecure_db",
  password: process.env.DB_PASSWORD || "Koushik@123",
  port: process.env.DB_PORT || 5432,
});

// Utility function to generate unique complaint ID
const generateComplaintId = () => {
  const prefix = 'CMP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Create a new complaint
const createComplaint = async (req, res) => {
  console.log('\n📝 Creating new complaint:');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const {
      category,
      description,
      location,
      reporterType,
      aadhaarData,
      attachments
    } = req.body;

    // Validation
    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category and description are required'
      });
    }

    if (!location || (!location.address && !location.formatted)) {
      return res.status(400).json({
        success: false,
        message: 'Location information is required'
      });
    }

    // Generate unique complaint ID
    const complaintId = generateComplaintId();
    
    // Prepare complaint data
    const complaintData = {
      complaint_id: complaintId,
      category: category,
      description: description,
      location_address: location.address || location.formatted,
      location_latitude: location.latitude,
      location_longitude: location.longitude,
      reporter_type: reporterType || 'anonymous',
      reporter_phone: null,
      reporter_name: null,
      aadhaar_number: null,
      aadhaar_verified: false,
      status: 'pending',
      priority: 'medium',
      attachments: attachments ? JSON.stringify(attachments) : null
    };

    // If reporter is verified and aadhaar data is provided
    if (reporterType === 'verified' && aadhaarData) {
      complaintData.aadhaar_number = aadhaarData.aadhaarNumber;
      complaintData.reporter_name = aadhaarData.name;
      complaintData.aadhaar_verified = true;
    }

    // Insert complaint into database
    const insertQuery = `
      INSERT INTO complaints (
        complaint_id, category, description, location_address, 
        location_latitude, location_longitude, reporter_type,
        reporter_phone, reporter_name, aadhaar_number, aadhaar_verified,
        status, priority, attachments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      complaintData.complaint_id,
      complaintData.category,
      complaintData.description,
      complaintData.location_address,
      complaintData.location_latitude,
      complaintData.location_longitude,
      complaintData.reporter_type,
      complaintData.reporter_phone,
      complaintData.reporter_name,
      complaintData.aadhaar_number,
      complaintData.aadhaar_verified,
      complaintData.status,
      complaintData.priority,
      complaintData.attachments
    ];

    console.log('📊 Executing database insert...');
    const result = await pool.query(insertQuery, values);
    const newComplaint = result.rows[0];

    console.log('✅ Complaint created successfully:', newComplaint.complaint_id);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaintId: newComplaint.complaint_id,
        category: newComplaint.category,
        description: newComplaint.description,
        location: newComplaint.location_address,
        status: newComplaint.status,
        createdAt: newComplaint.created_at
      }
    });

  } catch (error) {
    console.error('❌ Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: error.message
    });
  }
};

// Get all complaints (with optional filtering)
const getComplaints = async (req, res) => {
  try {
    const { category, status, limit = 10, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM complaints';
    let conditions = [];
    let values = [];
    let valueIndex = 1;

    // Add filters
    if (category) {
      conditions.push(`category = $${valueIndex++}`);
      values.push(category);
    }
    
    if (status) {
      conditions.push(`status = $${valueIndex++}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Get complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM complaints WHERE complaint_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error.message
    });
  }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    let query = 'UPDATE complaints SET status = $1, updated_at = NOW()';
    let values = [status];
    let valueIndex = 2;

    if (status === 'resolved' && resolution_notes) {
      query += `, resolution_notes = $${valueIndex++}, resolved_at = NOW()`;
      values.push(resolution_notes);
    }

    query += ` WHERE complaint_id = $${valueIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
      error: error.message
    });
  }
};

// Get complaint statistics
const getComplaintStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_complaints,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN reporter_type = 'verified' THEN 1 END) as verified_reports,
        COUNT(CASE WHEN reporter_type = 'anonymous' THEN 1 END) as anonymous_reports
      FROM complaints
    `;

    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC
    `;

    const [statsResult, categoryResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(categoryQuery)
    ]);

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        categories: categoryResult.rows
      }
    });

  } catch (error) {
    console.error('❌ Error fetching complaint stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint statistics',
      error: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintStats
};
