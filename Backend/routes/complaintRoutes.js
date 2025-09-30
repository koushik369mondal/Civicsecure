const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const complaintController = require('../controllers/complaintController');

router.post('/', authenticateToken, complaintController.createComplaint);
router.get('/my', authenticateToken, complaintController.getUserComplaints);
router.get('/:id', authenticateToken, complaintController.getComplaintById);
router.put('/:id/status', authenticateToken, complaintController.updateComplaintStatus);
router.get('/stats/my', authenticateToken, complaintController.getUserComplaintStats);

module.exports = router;
