const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// @desc    Get dashboard stats
// @route   GET /api/finance
// @access  Private (Admin only)
const getEarnings = async (req, res, next) => {
    try {
        let query = {};
        if (req.user.role === 'Staff') {
            query.$or = [{ user: req.user._id }, { staff: req.user._id }];
        }
        
        const orders = await Order.find(query);
        
        const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered');
        const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalOrders = orders.length;

        const staffCount = await User.countDocuments({ role: { $in: ['Staff', 'Admin'] } });
        const menuCount = await MenuItem.countDocuments();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter(o => o.createdAt >= today);
        const todayRevenue = todayOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').reduce((acc, order) => acc + order.totalAmount, 0);

        res.status(200).json({
            totalRevenue,
            totalOrders,
            todayRevenue,
            todayOrdersCount: todayOrders.length,
            staffCount,
            menuCount
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEarnings,
};
