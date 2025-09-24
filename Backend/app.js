
require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();

// Core middleware
app.use(helmet()); // secure headers [web:71][web:79]
app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000", 
    "http://localhost:5173",
    "http://localhost:5174"
  ], 
  credentials: true 
})); // CORS [web:78][web:75]

// Body parsing middleware with error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    // Store raw body for debugging if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced request logging middleware for debugging
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || 'undefined';
  const contentLength = req.headers['content-length'] || '0';
  
  console.log(`\n📝 Request Details:`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Content-Type: ${contentType}`);
  console.log(`   Content-Length: ${contentLength}`);
  console.log(`   Body exists: ${!!req.body}`);
  console.log(`   Body type: ${typeof req.body}`);
  
  next();
});

// JSON parsing error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('🚨 JSON Parse Error:', error.message);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      error: 'Malformed JSON'
    });
  }
  next();
});

// PG pool
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "civicsecure_db",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
});

// Test DB connection once at boot
(async () => {
  try {
    const r = await pool.query("SELECT NOW()");
    console.log(`✅ PostgreSQL connected at ${r.rows[0].now}`);
  } catch (e) {
    console.error("❌ PostgreSQL connection failed:", e.message);
  }
})(); // minimal boot check per pg best practice [web:67][web:68]

// Rate limits
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
app.use(generalLimiter); // simple global limit [web:73][web:75]

// Helpers
const validatePhone = (p) => /^\+91[6-9]\d{9}$/.test(p); // simple India format
const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const signToken = (uid, phone) => jwt.sign({ uid, phone }, process.env.JWT_SECRET || "change-me", { expiresIn: "30d" });

// Utility middleware for JSON validation
const requireJsonBody = (requiredFields = []) => {
  return (req, res, next) => {
    console.log('\n🔍 JSON Body Validation Middleware:');
    console.log('   Content-Type:', req.headers['content-type']);
    console.log('   Body exists:', !!req.body);
    console.log('   Body type:', typeof req.body);
    
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Request body must be valid JSON',
        code: 'INVALID_BODY',
        hint: 'Make sure to set Content-Type: application/json header'
      });
    }
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in req.body) || req.body[field] === undefined || req.body[field] === null) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
          code: 'MISSING_FIELD',
          requiredFields,
          receivedFields: Object.keys(req.body)
        });
      }
    }
    
    next();
  };
};

// Dev SMS
const sendOTP = async (phone, otp) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`📲 DEV OTP for ${phone}: ${otp}`);
    return true;
  }
  // TODO: integrate real SMS in prod
  return false;
};

// Auth middleware
const auth = async (req, res, next) => {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Access token required" });
  try {
    const decoded = jwt.verify(h.slice(7), process.env.JWT_SECRET || "change-me");
    const { rows } = await pool.query("SELECT id, phone, name, is_verified, created_at, last_login FROM users WHERE phone=$1", [decoded.phone]);
    if (!rows.length) return res.status(401).json({ success: false, message: "User not found" });
    req.user = rows[0];
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: e.name === "TokenExpiredError" ? "Token expired" : "Invalid token" });
  }
};

// ================================
// UTILITY ROUTES FOR DEBUGGING
// ================================

// Test route to debug request body parsing
app.post("/api/test-body", (req, res) => {
  console.log('\n🧪 Test Body Route Debug:');
  console.log('   Raw headers:', req.headers);
  console.log('   Content-Type:', req.headers['content-type']);
  console.log('   Content-Length:', req.headers['content-length']);
  console.log('   Body exists:', !!req.body);
  console.log('   Body type:', typeof req.body);
  console.log('   Body value:', req.body);
  console.log('   Body constructor:', req.body?.constructor?.name);
  console.log('   Keys in body:', req.body ? Object.keys(req.body) : 'N/A');
  
  res.json({
    success: true,
    message: 'Request body parsing test',
    debug: {
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      bodyExists: !!req.body,
      bodyType: typeof req.body,
      bodyConstructor: req.body?.constructor?.name,
      bodyKeys: req.body ? Object.keys(req.body) : null,
      bodyValue: req.body,
      timestamp: new Date().toISOString()
    }
  });
});

// ================================
// MAIN API ROUTES  
// ================================

// Routes
app.post("/api/send-otp", otpLimiter, async (req, res) => {
  const { phoneNumber } = req.body || {};
  if (!validatePhone(phoneNumber)) return res.status(400).json({ success: false, message: "Invalid phone number. Use +91XXXXXXXXXX" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`INSERT INTO users (phone) VALUES ($1) ON CONFLICT (phone) DO UPDATE SET updated_at = NOW()`, [phoneNumber]);
    await client.query(`DELETE FROM otp_codes WHERE phone=$1`, [phoneNumber]);
    const otp = genOTP();
    await client.query(`INSERT INTO otp_codes (phone, otp, expires_at) VALUES ($1,$2,$3)`, [phoneNumber, otp, new Date(Date.now() + 5 * 60 * 1000)]);
    if (!(await sendOTP(phoneNumber, otp))) throw new Error("SMS failed");
    await client.query("COMMIT");
    res.json({ success: true, message: "OTP sent", expiresIn: 300 });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  } finally {
    client.release();
  }
}); // structure mirrors minimal CRUD flows [web:68][web:74]

app.post("/api/verify-otp", loginLimiter, async (req, res) => {
  const { phoneNumber, otp } = req.body || {};
  if (!validatePhone(phoneNumber) || !/^\d{6}$/.test(otp)) return res.status(400).json({ success: false, message: "Invalid input" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT * FROM otp_codes WHERE phone=$1 AND is_used=false ORDER BY created_at DESC LIMIT 1`,
      [phoneNumber]
    );
    const rec = rows[0];
    if (!rec || rec.expires_at < new Date()) throw new Error("OTP expired");
    if (rec.otp !== otp) {
      await client.query(`UPDATE otp_codes SET attempts=attempts+1 WHERE id=$1`, [rec.id]);
      if (rec.attempts + 1 >= 3) await client.query(`DELETE FROM otp_codes WHERE id=$1`, [rec.id]);
      await client.query("COMMIT");
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    await client.query(`UPDATE otp_codes SET is_used=true WHERE id=$1`, [rec.id]);
    const u = await client.query(
      `UPDATE users SET is_verified=true, last_login=NOW() WHERE phone=$1 RETURNING id, phone, name, is_verified, created_at`,
      [phoneNumber]
    );
    const user = u.rows[0];
    const token = signToken(user.id, phoneNumber);
    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, phone: user.phone.replace("+91", ""), name: user.name, isVerified: user.is_verified, memberSince: user.created_at },
    });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(e.message === "OTP expired" ? 400 : 500).json({ success: false, message: e.message });
  } finally {
    client.release();
  }
});

app.get("/api/validate-token", auth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      phone: req.user.phone.replace("+91", ""),
      name: req.user.name,
      isVerified: req.user.is_verified,
      memberSince: req.user.created_at,
      lastLogin: req.user.last_login,
    },
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const t0 = Date.now();
    const r = await pool.query("SELECT NOW()");
    res.json({ success: true, status: "healthy", dbTime: `${Date.now() - t0}ms`, dbNow: r.rows[0].now });
  } catch {
    res.status(500).json({ success: false, status: "unhealthy" });
  }
});

// ================================
// AADHAAR VALIDATION ROUTES
// ================================

// Validate Aadhaar number against database
app.post("/api/validate-aadhaar", requireJsonBody(['aadhaarNumber']), async (req, res) => {
  try {
    console.log('\n🔍 Aadhaar Validation Request:');
    console.log('   Headers:', JSON.stringify(req.headers, null, 2));
    console.log('   Body:', JSON.stringify(req.body, null, 2));
    console.log('   Body type:', typeof req.body);
    console.log('   Body constructor:', req.body?.constructor?.name || 'N/A');
    
    // At this point, we know req.body exists and has aadhaarNumber
    const { aadhaarNumber } = req.body;
    
    console.log('   Extracted aadhaarNumber:', aadhaarNumber);
    
    // Type validation for aadhaarNumber
    if (typeof aadhaarNumber !== 'string' && typeof aadhaarNumber !== 'number') {
      console.error('❌ Aadhaar number has invalid type:', typeof aadhaarNumber);
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number must be a string or number',
        code: 'INVALID_AADHAAR_TYPE',
        receivedType: typeof aadhaarNumber,
        receivedValue: aadhaarNumber
      });
    }

    // Clean the input (remove spaces)
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');

    // Format validation (must be exactly 12 digits)
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number must be exactly 12 digits'
      });
    }

    // Database lookup
    const result = await pool.query(
      `SELECT aadhaar_number, name, gender, age, state, district 
       FROM aadhaar_dataset 
       WHERE aadhaar_number = $1 AND is_active = true`,
      [cleanAadhaar]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number not found in records'
      });
    }

    const aadhaarData = result.rows[0];

    // Return success with basic info (privacy-friendly)
    res.json({
      success: true,
      message: 'Aadhaar number validated successfully',
      data: {
        aadhaarNumber: cleanAadhaar,
        name: aadhaarData.name,
        gender: aadhaarData.gender,
        age: aadhaarData.age,
        state: aadhaarData.state,
        district: aadhaarData.district,
        verified: true
      }
    });

  } catch (error) {
    console.error('Aadhaar validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during validation'
    });
  }
});

// Get statistics (for debugging/admin)
app.get("/api/aadhaar/stats", async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count,
        COUNT(DISTINCT state) as unique_states,
        COUNT(DISTINCT district) as unique_districts
      FROM aadhaar_dataset 
      WHERE is_active = true
    `);

    res.json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

app.get("/", (req, res) => res.json({ success: true, message: "CivicSecure API v2" }));

// 404 + error
app.use((req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Start
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Graceful shutdown
const shutdown = async () => {
  console.log("🔻 Shutting down...");
  try {
    await pool.end();
    console.log("✅ PG pool closed");
  } finally {
    process.exit(0);
  }
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
