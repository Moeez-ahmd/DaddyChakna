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
const mediaUpload = require('../middleware/mediaUploadMiddleware');

router.route('/')
    .get(getBanners)
    .post(protect, authorize('Admin'), mediaUpload.single('image'), createBanner);

router.route('/admin')
    .get(protect, authorize('Admin'), getAllBanners);

router.route('/:id')
    .put(protect, authorize('Admin'), mediaUpload.single('image'), updateBanner)
    .delete(protect, authorize('Admin'), deleteBanner);

module.exports = router;
