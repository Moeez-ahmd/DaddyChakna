const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Deal = require('../models/Deal');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        const { items, totalAmount, orderType, deliveryAddress, customerId, customerName, tableNumber } = req.body;

        if (!items || items.length === 0) {
            res.status(400);
            throw new Error('No order items');
        }

        // Automatically detect itemType for each item in the order
        const processedItems = await Promise.all(items.map(async (item) => {
            const itemId = item.menuItem;
            
            const menuItem = await MenuItem.findById(itemId);
            if (menuItem) {
                return { ...item, itemType: 'MenuItem' };
            }

            const deal = await Deal.findById(itemId);
            if (deal) {
                return { ...item, itemType: 'Deal' };
            }

            return { ...item, itemType: 'MenuItem' };
        }));

        // If Admin/Staff, they can specify a customerId
        let orderOwner = req.user._id;
        if ((req.user.role === 'Admin' || req.user.role === 'Staff') && customerId) {
            orderOwner = customerId;
        }

        const order = await Order.create({
            user: (req.user.role === 'Admin' || req.user.role === 'Staff') && customerId ? customerId : (req.user.role === 'Customer' ? req.user._id : null),
            customerName: customerName || null,
            staff: (req.user.role === 'Admin' || req.user.role === 'Staff') ? req.user._id : null,
            items: processedItems,
            totalAmount: Number(totalAmount).toFixed(2),
            orderType,
            deliveryAddress,
            tableNumber: orderType === 'Dine In' ? tableNumber : null,
        });

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('staff', 'name email')
            .populate('items.menuItem');

        if (order) {
            // Check if user is Admin/Staff or the order belongs to them
            if (req.user.role === 'Admin' || req.user.role === 'Staff' || order.user._id.toString() === req.user._id.toString()) {
                res.status(200).json(order);
            } else {
                res.status(403);
                throw new Error('Not authorized to view this order');
            }
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = { user: req.user._id };

        if (status === 'active') {
            query.status = { $nin: ['Completed', 'Cancelled'] };
        } else if (status === 'completed') {
            query.status = 'Completed';
        } else if (status === 'cancelled') {
            query.status = 'Cancelled';
        }

        const orders = await Order.find(query)
            .populate('items.menuItem', 'name image price')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin/Staff)
const getOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        
        // Role-based access
        if (req.user.role === 'Staff') {
            query.$or = [{ user: req.user._id }, { staff: req.user._id }];
        }

        // Search filter (Order # or Customer Name)
        if (req.query.searchTerm) {
            const search = req.query.searchTerm;
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { orderNumber: { $regex: search, $options: 'i' } },
                    { customerName: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Order Type filter
        if (req.query.orderType) {
            query.orderType = req.query.orderType;
        }

        // Status filter
        if (req.query.status) {
            query.status = req.query.status;
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('user', 'id name')
            .populate('staff', 'name')
            .populate('items.menuItem', 'name image price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Staff)
const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (req.user.role === 'Customer') {
            if (req.body.status !== 'Cancelled') {
                res.status(403);
                throw new Error('Customers can only cancel orders');
            }
            if (order.user && order.user.toString() !== req.user._id.toString()) {
                res.status(403);
                throw new Error('Not authorized to update this order');
            }
            const uncancelableStatuses = ['Ready', 'Served', 'Delivered', 'Completed', 'Cancelled'];
            if (uncancelableStatuses.includes(order.status)) {
                res.status(400);
                throw new Error(`Order cannot be cancelled because it is already ${order.status}`);
            }
        }

        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private (Admin only for full update)
const updateOrder = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        // Only Admin can modify order content
        if (req.user.role !== 'Admin') {
            res.status(403);
            throw new Error('Only Admins can modify order contents');
        }

        order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin only)
const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (req.user.role !== 'Admin') {
            res.status(403);
            throw new Error('Not authorized to delete orders');
        }

        await order.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
};
