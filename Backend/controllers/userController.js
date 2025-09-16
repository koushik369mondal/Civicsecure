const pool = require('../db');
const { sanitizeUser, errorResponse, successResponse } = require('../utils/helpers');

// Update user profile controller
const updateProfileController = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
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
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse('User not found'));
    }

    res.json(successResponse({
      user: sanitizeUser(result.rows[0])
    }, 'Profile retrieved successfully'));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

module.exports = {
  updateProfileController,
  getProfileController
};
