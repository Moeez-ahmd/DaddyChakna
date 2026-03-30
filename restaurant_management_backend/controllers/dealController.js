const Deal = require('../models/Deal');

// @desc    Get all deals
// @route   GET /api/deals
// @access  Public
const getDeals = async (req, res, next) => {
    try {
        const deals = await Deal.find({ isActive: true }).populate('menuItems.menuItem');
        res.status(200).json(deals);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single deal
// @route   GET /api/deals/:id
// @access  Public
const getDeal = async (req, res, next) => {
    try {
        const deal = await Deal.findById(req.params.id).populate('menuItems.menuItem');
        
        if (!deal) {
            res.status(404);
            throw new Error('Deal not found');
        }

        res.status(200).json(deal);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDeals,
    getDeal,
};
