const express = require('express');
const router = express.Router();
const { getStaffMembers, createStaffMember, deleteStaffMember, updateStaffMember } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('Admin'), getStaffMembers)
    .post(protect, authorize('Admin'), createStaffMember);

router.route('/:id')
    .put(protect, authorize('Admin'), updateStaffMember)
    .delete(protect, authorize('Admin'), deleteStaffMember);

module.exports = router;
