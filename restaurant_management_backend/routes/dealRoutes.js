const express = require('express');
const router = express.Router();
const { getDeals, getDeal } = require('../controllers/dealController');

router.route('/').get(getDeals);
router.route('/:id').get(getDeal);

module.exports = router;
