const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintStats
} = require('../controllers/complaintController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for complaint submission
const complaintSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 complaint submissions per windowMs
  message: {
    success: false,
    message: 'Too many complaints submitted from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware for JSON validation
const requireJsonBody = (requiredFields = []) => {
  return (req, res, next) => {
    console.log('\n🔍 Complaint Route JSON Validation:');
    console.log('   Content-Type:', req.headers['content-type']);
    console.log('   Body exists:', !!req.body);
    console.log('   Body type:', typeof req.body);
    
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Request body must be valid JSON',
        code: 'INVALID_BODY'
      });
    }
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in req.body) || req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        return res.status(400).json({
          success: false,
          message: `Missing or empty required field: ${field}`,
          code: 'MISSING_FIELD',
          requiredFields,
          receivedFields: Object.keys(req.body)
        });
      }
    }
    
    next();
  };
};

// ================================
// PUBLIC ROUTES (No authentication required)
// ================================

// POST /api/complaints - Submit a new complaint
router.post('/', 
  complaintSubmissionLimiter,
  requireJsonBody(['category', 'description', 'location']),
  createComplaint
);

// GET /api/complaints - Get all complaints (with optional filtering)
// Query params: ?category=road&status=pending&limit=10&offset=0
router.get('/', getComplaints);

// GET /api/complaints/stats - Get complaint statistics
router.get('/stats', getComplaintStats);

// GET /api/complaints/:id - Get specific complaint by ID
router.get('/:id', getComplaintById);

// ================================
// PROTECTED ROUTES (Authentication required - for admin/staff)
// ================================

// PUT /api/complaints/:id/status - Update complaint status (admin only)
router.put('/:id/status', 
  authenticateToken, // Require authentication
  requireJsonBody(['status']),
  updateComplaintStatus
);

// ================================
// ROUTE DOCUMENTATION
// ================================

// GET /api/complaints/docs - API documentation
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Complaints API Documentation',
    endpoints: {
      'POST /api/complaints': {
        description: 'Submit a new complaint',
        requiredFields: ['category', 'description', 'location'],
        optionalFields: ['reporterType', 'aadhaarData', 'attachments'],
        rateLimit: '5 requests per 15 minutes per IP',
        example: {
          category: 'road',
          description: 'Pothole on main street',
          location: {
            address: '123 Main Street, City',
            latitude: 12.9716,
            longitude: 77.5946,
            formatted: '123 Main Street, City'
          },
          reporterType: 'anonymous',
          aadhaarData: null,
          attachments: []
        }
      },
      'GET /api/complaints': {
        description: 'Get all complaints with optional filtering',
        queryParams: ['category', 'status', 'limit', 'offset'],
        example: '/api/complaints?category=road&status=pending&limit=10'
      },
      'GET /api/complaints/stats': {
        description: 'Get complaint statistics',
        returns: 'Overview stats and category breakdown'
      },
      'GET /api/complaints/:id': {
        description: 'Get specific complaint by complaint ID',
        example: '/api/complaints/CMP-123ABC-4DEF'
      },
      'PUT /api/complaints/:id/status': {
        description: 'Update complaint status (requires authentication)',
        requiredFields: ['status'],
        validStatuses: ['pending', 'in-progress', 'resolved', 'rejected'],
        authentication: 'Bearer token required'
      }
    }
  });
});

module.exports = router;
