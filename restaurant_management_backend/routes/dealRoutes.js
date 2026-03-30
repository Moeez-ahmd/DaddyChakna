const express = require('express');
const router = express.Router();
const {
    getDeals,
    getDeal,
    createDeal,
    updateDeal,
    deleteDeal,
} = require('../controllers/dealController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getDeals)
    .post(protect, authorize('Admin'), upload.single('image'), createDeal);

router.route('/:id')
    .get(getDeal)
    .put(protect, authorize('Admin'), upload.single('image'), updateDeal)
    .delete(protect, authorize('Admin'), deleteDeal);

module.exports = router;
