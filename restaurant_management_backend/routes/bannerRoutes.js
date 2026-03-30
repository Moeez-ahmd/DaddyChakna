const express = require('express');
const router = express.Router();
const {
    getBanners,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
} = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getBanners)
    .post(protect, authorize('Admin'), upload.single('image'), createBanner);

router.route('/admin')
    .get(protect, authorize('Admin'), getAllBanners);

router.route('/:id')
    .put(protect, authorize('Admin'), upload.single('image'), updateBanner)
    .delete(protect, authorize('Admin'), deleteBanner);

module.exports = router;
