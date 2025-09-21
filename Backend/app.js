
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
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true })); // CORS [web:78][web:75]
app.use(express.json());

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
