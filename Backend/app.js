const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Express 5.1.0 middleware - handle req.body properly
app.use((req, res, next) => {
  express.json()(req, res, (err) => {
    if (!req.body) req.body = {};
    next(err);
  });
});

app.use(express.urlencoded({ extended: true }));

// PostgreSQL pool setup with optimized configuration
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "civicsecure_db",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
  acquireTimeoutMillis: 60000, // return an error after 60 seconds if acquiring a connection times out
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Enhanced rate limiting configurations
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests per IP
  message: { 
    success: false, 
    message: 'Too many OTP requests. Try again later.' 
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many OTP requests from this IP. Please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per IP
  message: { 
    success: false, 
    message: 'Too many login attempts. Try again later.' 
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 general requests per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate Indian phone number format
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Generate JWT token with additional security
const generateToken = (userId, phone) => {
  return jwt.sign(
    { 
      userId, 
      phone,
      timestamp: Date.now(),
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET || 'your-default-secret-key-change-in-production',
    { expiresIn: '30d' }
  );
};

// Enhanced middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7);

    jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-change-in-production', async (err, decoded) => {
      if (err) {
        let message = 'Invalid token';
        if (err.name === 'TokenExpiredError') {
          message = 'Token has expired';
        } else if (err.name === 'JsonWebTokenError') {
          message = 'Invalid token format';
        }
        
        return res.status(401).json({
          success: false,
          message: message
        });
      }

      try {
        const result = await pool.query(
          'SELECT id, phone, name, is_verified, created_at, last_login FROM users WHERE phone = $1',
          [decoded.phone]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        req.user = result.rows[0];
        next();
      } catch (dbError) {
        console.error('Database error in auth middleware:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Enhanced Send OTP function
const sendOTP = async (phoneNumber, otp) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Attempting to send SMS via MSG91...');
      
      const message = `Your CivicSecure verification code is ${otp}. Valid for 5 minutes.`;
      
      const url = `https://control.msg91.com/api/sendhttp.php?authkey=${process.env.MSG91_API_KEY}&mobiles=${phoneNumber.replace('+91', '')}&message=${encodeURIComponent(message)}&sender=CIVSEC&route=4`;
      
      const response = await fetch(url);
      const result = await response.text();
      
      console.log('MSG91 Response:', result);
      console.log('Response Status:', response.status);
      
      if (response.ok && !result.includes('ERROR')) {
        console.log('✅ SMS sent successfully via MSG91');
        return { success: true };
      } else {
        console.log('❌ MSG91 Error:', result);
        return { success: false };
      }
    } catch (error) {
      console.error('MSG91 API Error:', error);
      return { success: false };
    }
  } else {
    // Development mode - show OTP in console
    console.log(`📱 Development OTP for ${phoneNumber}: ${otp}`);
    return { success: true };
  }
};

// Cleanup expired OTPs periodically
const cleanupExpiredOTPs = async () => {
  try {
    const result = await pool.query(
      'DELETE FROM otp_codes WHERE otp_expiry < NOW()'
    );
    if (result.rowCount > 0) {
      console.log(`🧹 Cleaned up ${result.rowCount} expired OTP(s)`);
    }
  } catch (error) {
    console.error('Error cleaning expired OTPs:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredOTPs, 60 * 60 * 1000);

// ================================
// AUTHENTICATION ROUTES
// ================================

// Send OTP endpoint
app.post("/api/send-otp", otpLimiter, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { phoneNumber } = req.body;

    // Validation
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use +91XXXXXXXXXX'
      });
    }

    // Create user if doesn't exist
    await client.query(
      `INSERT INTO users (phone) VALUES ($1) 
       ON CONFLICT (phone) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
      [phoneNumber]
    );

    // Delete any existing unused OTPs
    await client.query(
      'DELETE FROM otp_codes WHERE phone = $1 AND (is_used = false OR otp_expiry < NOW())',
      [phoneNumber]
    );

    // Generate and store new OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await client.query(
      'INSERT INTO otp_codes (phone, otp, otp_expiry) VALUES ($1, $2, $3)',
      [phoneNumber, otp, expiryTime]
    );

    // Send OTP
    const smsResult = await sendOTP(phoneNumber, otp);

    if (smsResult.success) {
      await client.query('COMMIT');
      res.json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 300
      });
    } else {
      await client.query('ROLLBACK');
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
});

// Verify OTP endpoint
app.post("/api/verify-otp", loginLimiter, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { phoneNumber, otp } = req.body;

    // Validation
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    // Get latest OTP record
    const otpResult = await client.query(
      `SELECT * FROM otp_codes 
       WHERE phone = $1 AND is_used = false 
       ORDER BY created_at DESC LIMIT 1`,
      [phoneNumber]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new one.'
      });
    }

    const otpRecord = otpResult.rows[0];

    // Check expiry
    if (new Date() > otpRecord.otp_expiry) {
      await client.query('DELETE FROM otp_codes WHERE id = $1', [otpRecord.id]);
      await client.query('COMMIT');
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await client.query('DELETE FROM otp_codes WHERE id = $1', [otpRecord.id]);
      await client.query('COMMIT');
      return res.status(400).json({
        success: false,
        message: 'Too many invalid attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await client.query(
        'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1',
        [otpRecord.id]
      );
      await client.query('COMMIT');
      
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - (otpRecord.attempts + 1)} attempts remaining.`
      });
    }

    // OTP is valid - mark as used
    await client.query(
      'UPDATE otp_codes SET is_used = true WHERE id = $1',
      [otpRecord.id]
    );

    // Update user
    const userResult = await client.query(
      `UPDATE users 
       SET is_verified = true, last_login = CURRENT_TIMESTAMP 
       WHERE phone = $1 
       RETURNING id, phone, name, is_verified, created_at`,
      [phoneNumber]
    );

    const user = userResult.rows[0];

    // Generate token
    const token = generateToken(user.id, phoneNumber);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone.replace('+91', ''),
        name: user.name,
        isNewUser: !user.name,
        isVerified: user.is_verified,
        memberSince: user.created_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
});

// Validate token endpoint
app.get("/api/validate-token", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        phone: req.user.phone.replace('+91', ''),
        name: req.user.name,
        isVerified: req.user.is_verified,
        memberSince: req.user.created_at,
        lastLogin: req.user.last_login
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
app.put("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 50 characters'
      });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name.trim(), req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: result.rows[0].id,
        phone: result.rows[0].phone.replace('+91', ''),
        name: result.rows[0].name
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ================================
// COMPLAINT ROUTES
// ================================

// Create complaint (requires authentication)
app.post("/api/complaints", authenticateToken, async (req, res) => {
  const { category, description, location, attachments = [], priority = 'medium' } = req.body;
  
  // Validation
  if (!category || !description || !location) {
    return res.status(400).json({
      success: false,
      message: 'Category, description, and location are required'
    });
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid priority level'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO complaints (category, description, location, attachments, reporter_type, status, priority, user_id, reporter_phone, reporter_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
      [
        category.trim(), 
        description.trim(), 
        location.trim(), 
        JSON.stringify(attachments), 
        'authenticated',
        'submitted',
        priority,
        req.user.id,
        req.user.phone,
        req.user.name || 'User'
      ]
    );
    
    res.status(201).json({ 
      success: true,
      message: 'Complaint submitted successfully',
      complaint: result.rows[0] 
    });
  } catch (error) {
    console.error("Failed to create complaint:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create complaint" 
    });
  }
});

// Get user's complaints with pagination
app.get("/api/complaints/my", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let whereClause = 'WHERE user_id = $1';
    let queryParams = [req.user.id];

    if (status && ['submitted', 'in_progress', 'under_review', 'resolved', 'closed', 'rejected'].includes(status)) {
      whereClause += ' AND status = $2';
      queryParams.push(status);
    }

    const result = await pool.query(
      `SELECT * FROM complaints ${whereClause} ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM complaints ${whereClause}`,
      queryParams
    );
    
    res.json({
      success: true,
      complaints: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error("Failed to fetch complaints:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch complaints" 
    });
  }
});

// Get complaint by ID
app.get("/api/complaints/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT c.*, u.name as user_name 
       FROM complaints c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }
    
    res.json({
      success: true,
      complaint: result.rows[0]
    });
  } catch (error) {
    console.error("Failed to fetch complaint:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch complaint" 
    });
  }
});

// Get complaint statistics for user
app.get("/api/complaints/stats/my", authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_complaints,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_complaints,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days
      FROM complaints
      WHERE user_id = $1
    `, [req.user.id]);
    
    res.json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch statistics" 
    });
  }
});

// ================================
// GENERAL ROUTES
// ================================

// Root endpoint with API documentation
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CiciSecure Backend API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    documentation: {
      authentication: {
        sendOtp: "POST /api/send-otp",
        verifyOtp: "POST /api/verify-otp",
        validateToken: "GET /api/validate-token",
        updateProfile: "PUT /api/user/profile"
      },
      complaints: {
        create: "POST /api/complaints",
        getUserComplaints: "GET /api/complaints/my",
        getComplaintById: "GET /api/complaints/:id",
        getUserStats: "GET /api/complaints/stats/my"
      },
      general: {
        health: "GET /api/health",
        documentation: "GET /"
      }
    }
  });
});

// Enhanced health check
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    const dbStart = Date.now();
    const result = await pool.query('SELECT NOW(), version()');
    const dbResponseTime = Date.now() - dbStart;
    
    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`,
        timestamp: result.rows[0].now,
        version: result.rows[0].version.split(' ')[0]
      },
      server: {
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsage: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        },
        nodeVersion: process.version
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});


// 404 handler (alternative)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    suggestion: "Check the API documentation at GET /"
  });
});



// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, gracefully shutting down...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 CiciSecure server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '⚠️  Using default (change in production!)'}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
  }
});
