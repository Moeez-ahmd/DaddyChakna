const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const total = await MenuItem.countDocuments(filter);
        const items = await MenuItem.find(filter)
            .populate('category', 'name')
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: items
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findById(req.params.id).populate('category', 'name');
        
        if (!item) {
            res.status(404);
            throw new Error('Menu item not found');
        }

        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private (Admin/Staff)
const createMenuItem = async (req, res, next) => {
    try {
        const itemData = { ...req.body };
        if (req.file) {
            itemData.image = `/uploads/${req.file.filename}`;
        }
        const item = await MenuItem.create(itemData);
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin/Staff)
const updateMenuItem = async (req, res, next) => {
    try {
        let item = await MenuItem.findById(req.params.id);

        if (!item) {
            res.status(404);
            throw new Error('Menu item not found');
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin only)
const deleteMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findById(req.params.id);

        if (!item) {
            res.status(404);
            throw new Error('Menu item not found');
        }

        await item.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
};
