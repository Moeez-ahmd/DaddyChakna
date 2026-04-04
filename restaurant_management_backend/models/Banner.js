const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Please add a banner image'],
        },
        mediaType: {
            type: String,
            enum: ['IMAGE', 'VIDEO'],
            default: 'IMAGE'
        },
        purpose: {
            type: String,
            required: [true, 'Please add a purpose'],
            enum: ['New Product', 'New Deal', 'Advertisement'],
        },
        linkType: {
            type: String,
            enum: ['Product', 'Deal', 'None'],
            default: 'None',
        },
        linkId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'linkType', // Dynamically reference based on linkType
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Note: refPath should point to a string which is a valid model name.
// We'll use a hack to ensure the refPath works or just handle it in controller.
// Actually, let's just use refPath: 'linkRefModel' and add a hidden field.
// Or simplify: keep it as ObjectId and the frontend/controller will know what it is.

module.exports = mongoose.model('Banner', bannerSchema);
