const Banner = require('../models/Banner');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort('sortOrder');
        res.status(200).json(banners);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all banners for admin
// @route   GET /api/banners/admin
// @access  Private (Admin)
const getAllBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find().sort('sortOrder');
        res.status(200).json(banners);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private (Admin)
const createBanner = async (req, res, next) => {
    try {
        const bannerData = { ...req.body };
        if (req.file) {
            bannerData.image = `/uploads/${req.file.filename}`;
            bannerData.mediaType = req.file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
        }
        
        if (bannerData.linkType === 'None' || bannerData.linkId === '') {
            bannerData.linkId = null;
        }

        const banner = await Banner.create(bannerData);
        res.status(201).json(banner);
    } catch (error) {
        next(error);
    }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private (Admin)
const updateBanner = async (req, res, next) => {
    try {
        let banner = await Banner.findById(req.params.id);

        if (!banner) {
            res.status(404);
            throw new Error('Banner not found');
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
            updateData.mediaType = req.file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
        }

        if (updateData.linkType === 'None' || updateData.linkId === '') {
            updateData.linkId = null;
        }

        banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(banner);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin)
const deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            res.status(404);
            throw new Error('Banner not found');
        }

        await banner.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBanners,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
};
