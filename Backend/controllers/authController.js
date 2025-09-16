const pool = require('../db');
const { generateOTP, generateToken, sanitizeUser, errorResponse, successResponse } = require('../utils/helpers');
const { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } = require('../utils/constants');

// Send OTP function
const sendOTP = async (phoneNumber, otp) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`📱 Production: Sending OTP ${otp} to ${phoneNumber}`);
    return { success: true };
  } else {
    console.log(`📱 Development OTP for ${phoneNumber}: ${otp}`);
    return { success: true };
  }
};

// Send OTP controller
const sendOTPController = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { phoneNumber } = req.body;

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
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await client.query(
      'INSERT INTO otp_codes (phone, otp, otp_expiry) VALUES ($1, $2, $3)',
      [phoneNumber, otp, expiryTime]
    );

    // Send OTP
    const smsResult = await sendOTP(phoneNumber, otp);

    if (smsResult.success) {
      await client.query('COMMIT');
      res.json(successResponse(
        { expiresIn: OTP_EXPIRY_MINUTES * 60 },
        'OTP sent successfully'
      ));
    } else {
      await client.query('ROLLBACK');
      res.status(500).json(errorResponse('Failed to send OTP'));
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Send OTP error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  } finally {
    client.release();
  }
};

// Verify OTP controller
const verifyOTPController = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { phoneNumber, otp } = req.body;

    // Get latest OTP record
    const otpResult = await client.query(
      `SELECT * FROM otp_codes 
       WHERE phone = $1 AND is_used = false 
       ORDER BY created_at DESC LIMIT 1`,
      [phoneNumber]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json(errorResponse('OTP not found or expired. Please request a new one.'));
    }

    const otpRecord = otpResult.rows[0];

    // Check expiry
    if (new Date() > otpRecord.otp_expiry) {
      await client.query('DELETE FROM otp_codes WHERE id = $1', [otpRecord.id]);
      await client.query('COMMIT');
      return res.status(400).json(errorResponse('OTP has expired. Please request a new one.'));
    }

    // Check attempts
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await client.query('DELETE FROM otp_codes WHERE id = $1', [otpRecord.id]);
      await client.query('COMMIT');
      return res.status(400).json(errorResponse('Too many invalid attempts. Please request a new OTP.'));
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await client.query(
        'UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1',
        [otpRecord.id]
      );
      await client.query('COMMIT');
      
      return res.status(400).json(errorResponse(
        `Invalid OTP. ${OTP_MAX_ATTEMPTS - (otpRecord.attempts + 1)} attempts remaining.`
      ));
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
    const token = generateToken(user.id, phoneNumber);

    await client.query('COMMIT');

    res.json(successResponse({
      token,
      user: {
        ...sanitizeUser(user),
        isNewUser: !user.name
      }
    }, 'Login successful'));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verify OTP error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  } finally {
    client.release();
  }
};

// Validate token controller
const validateTokenController = async (req, res) => {
  try {
    res.json(successResponse({
      user: sanitizeUser(req.user)
    }, 'Token is valid'));
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

module.exports = {
  sendOTPController,
  verifyOTPController,
  validateTokenController
};
