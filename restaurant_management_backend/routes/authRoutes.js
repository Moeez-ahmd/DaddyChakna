const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateMe, deleteMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('profilePic'), updateMe);
router.delete('/me', protect, deleteMe);

module.exports = router;
