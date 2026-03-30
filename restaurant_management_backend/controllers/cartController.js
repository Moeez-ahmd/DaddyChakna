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

        // Automatically detect itemType for each item
        const processedItems = await Promise.all(items.map(async (item) => {
            const itemId = item.menuItem;
            
            // Check if it's a MenuItem
            const menuItem = await MenuItem.findById(itemId);
            if (menuItem) {
                return { ...item, itemType: 'MenuItem' };
            }

            // Check if it's a Deal
            const deal = await Deal.findById(itemId);
            if (deal) {
                return { ...item, itemType: 'Deal' };
            }

            // Fallback or error if not found? 
            // We'll keep it as MenuItem by default but this might cause issues if ID is invalid
            return { ...item, itemType: 'MenuItem' };
        }));

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
