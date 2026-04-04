const express = require('express');
const router = express.Router();
const { getHomeMedia, uploadHomeMedia, deleteHomeMedia } = require('../controllers/homeMediaController');
const { protect, authorize } = require('../middleware/authMiddleware');
const mediaUpload = require('../middleware/mediaUploadMiddleware');

// Public route to fetch media for home page
router.get('/', getHomeMedia);

// Admin only routes for modification
router.post('/upload', protect, authorize('Admin'), mediaUpload.single('file'), uploadHomeMedia);
router.delete('/:id', protect, authorize('Admin'), deleteHomeMedia);

module.exports = router;
