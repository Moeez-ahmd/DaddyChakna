const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Deal = require('../models/Deal');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.menuItem');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user cart (add/remove items or change quantity)
// @route   PUT /api/cart
// @access  Private
const updateCart = async (req, res, next) => {
    try {
        const { items } = req.body;

        // Automatically detect itemType for each item efficiently
        const itemIds = items.map(item => item.menuItem);
        const [menuItems, deals] = await Promise.all([
            MenuItem.find({ _id: { $in: itemIds } }).select('_id'),
            Deal.find({ _id: { $in: itemIds } }).select('_id')
        ]);

        const menuItemIdSet = new Set(menuItems.map(m => m._id.toString()));
        const dealIdSet = new Set(deals.map(d => d._id.toString()));

        const processedItems = items.map(item => {
            const idStr = item.menuItem.toString();
            if (menuItemIdSet.has(idStr)) {
                return { ...item, itemType: 'MenuItem' };
            } else if (dealIdSet.has(idStr)) {
                return { ...item, itemType: 'Deal' };
            }
            return { ...item, itemType: 'MenuItem' }; // Default fallback
        });


        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: processedItems });
        } else {
            cart.items = processedItems;
            await cart.save();
        }

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.menuItem');
        
        res.status(200).json(updatedCart);
    } catch (error) {
        next(error);
    }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.status(200).json(cart);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    updateCart,
    clearCart,
};
