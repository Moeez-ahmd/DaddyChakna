const HomeMedia = require('../models/HomeMedia');
const fs = require('fs');
const path = require('path');

// @desc    Get all home media
// @route   GET /api/homemedia
// @access  Public
const getHomeMedia = async (req, res, next) => {
    try {
        const media = await HomeMedia.find().sort({ createdAt: -1 });
        res.status(200).json(media);
    } catch (error) {
        next(error);
    }
};

// @desc    Upload new home media
// @route   POST /api/homemedia/upload
// @access  Private/Admin
const uploadHomeMedia = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        const isVideo = req.file.mimetype.startsWith('video/');
        const mediaType = isVideo ? 'VIDEO' : 'IMAGE';
        
        // We ensure that it's accessible via public endpoint which routes to /uploads/
        const mediaUrl = `/uploads/${req.file.filename}`;

        const homeMedia = await HomeMedia.create({
            mediaType,
            mediaUrl,
            filename: req.file.filename
        });

        res.status(201).json(homeMedia);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete home media
// @route   DELETE /api/homemedia/:id
// @access  Private/Admin
const deleteHomeMedia = async (req, res, next) => {
    try {
        const media = await HomeMedia.findById(req.params.id);

        if (!media) {
            res.status(404);
            throw new Error('Media not found');
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', 'uploads', media.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await media.deleteOne();
        res.status(200).json({ message: 'Media removed effectively' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHomeMedia,
    uploadHomeMedia,
    deleteHomeMedia
};
