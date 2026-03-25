const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getMyOrders, getOrders, updateOrderStatus, updateOrder, deleteOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('Admin', 'Staff'), getOrders)
    .post(protect, createOrder);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, authorize('Admin'), updateOrder)
    .delete(protect, authorize('Admin'), deleteOrder);

router.route('/:id/status').put(protect, authorize('Admin', 'Staff', 'Customer'), updateOrderStatus);

module.exports = router;
