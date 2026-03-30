const Deal = require('../models/Deal');

// @desc    Get all deals
// @route   GET /api/deals
// @access  Public
const getDeals = async (req, res, next) => {
    try {
        const deals = await Deal.find().populate('menuItems.menuItem');
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

// @desc    Create new deal
// @route   POST /api/deals
// @access  Private (Admin)
const createDeal = async (req, res, next) => {
    try {
        const dealData = { ...req.body };
        
        // Handle menuItems if sent as stringified JSON (common with FormData)
        if (typeof dealData.menuItems === 'string') {
            try {
                dealData.menuItems = JSON.parse(dealData.menuItems);
            } catch (e) {
                // Keep it as is or handle error
            }
        }

        if (req.file) {
            dealData.image = `/uploads/${req.file.filename}`;
        }

        const deal = await Deal.create(dealData);
        res.status(201).json(deal);
    } catch (error) {
        next(error);
    }
};

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private (Admin)
const updateDeal = async (req, res, next) => {
    try {
        let deal = await Deal.findById(req.params.id);

        if (!deal) {
            res.status(404);
            throw new Error('Deal not found');
        }

        const updateData = { ...req.body };
        
        // Handle menuItems if sent as stringified JSON
        if (typeof updateData.menuItems === 'string') {
            try {
                updateData.menuItems = JSON.parse(updateData.menuItems);
            } catch (e) {
                // Keep it as is
            }
        }

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        deal = await Deal.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(deal);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private (Admin)
const deleteDeal = async (req, res, next) => {
    try {
        const deal = await Deal.findById(req.params.id);

        if (!deal) {
            res.status(404);
            throw new Error('Deal not found');
        }

        await deal.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDeals,
    getDeal,
    createDeal,
    updateDeal,
    deleteDeal,
};
