const express = require('express');
const router = express.Router();
const { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuItemController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getMenuItems)
    .post(protect, authorize('Admin'), upload.single('image'), createMenuItem);

router.route('/:id')
    .get(getMenuItem)
    .put(protect, authorize('Admin'), upload.single('image'), updateMenuItem)
    .delete(protect, authorize('Admin'), deleteMenuItem);

module.exports = router;
