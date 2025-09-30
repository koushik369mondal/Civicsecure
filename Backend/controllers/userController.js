const pool = require('../db');
const { sanitizeUser, errorResponse, successResponse } = require('../utils/helpers');

// Create user profile controller
const createProfileController = async (req, res) => {
  try {
    const { user_id, email, phone, name, avatar_url } = req.body;

    // Check if profile already exists
    const existingProfile = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [user_id]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(409).json(errorResponse('Profile already exists for this user'));
    }

    // Create new profile
    const result = await pool.query(
      'INSERT INTO user_profiles (user_id, email, phone, name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, email, phone, name, avatar_url]
    );

    res.status(201).json(successResponse({
      profile: result.rows[0]
    }, 'Profile created successfully'));
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// Update user profile controller
const updateProfileController = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      'UPDATE user_profiles SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, req.user.id]
    );

    res.json(successResponse({
      user: sanitizeUser(result.rows[0])
    }, 'Profile updated successfully'));
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// Get user profile controller
const getProfileController = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse('User profile not found'));
    }

    res.json(successResponse({
      profile: result.rows[0]
    }, 'Profile retrieved successfully'));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

module.exports = {
  createProfileController,
  updateProfileController,
  getProfileController
};
