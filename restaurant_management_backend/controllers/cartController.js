const Cart = require('../models/Cart');

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

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items });
        } else {
            cart.items = items;
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
