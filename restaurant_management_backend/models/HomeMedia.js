const mongoose = require('mongoose');

const homeMediaSchema = new mongoose.Schema({
    mediaType: {
        type: String,
        enum: ['IMAGE', 'VIDEO'],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HomeMedia', homeMediaSchema);
