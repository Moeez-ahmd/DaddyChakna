const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getCategories)
    .post(protect, authorize('Admin'), upload.single('image'), createCategory);

router.route('/:id')
    .put(protect, authorize('Admin'), upload.single('image'), updateCategory)
    .delete(protect, authorize('Admin'), deleteCategory);

module.exports = router;
