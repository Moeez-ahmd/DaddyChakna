const express = require('express');
const router = express.Router();
const { getEarnings } = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorize('Admin', 'Staff'), getEarnings);

module.exports = router;
