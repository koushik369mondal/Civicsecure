const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.put('/profile', authenticateToken, userController.updateUserProfile);

module.exports = router;
