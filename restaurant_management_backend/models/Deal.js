const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a deal name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
        },
<<<<<<< HEAD
=======
        image: {
            type: String,
            default: 'no-deal-image.jpg',
        },
>>>>>>> 2647102eec04afbcaae065ce958827a1d78edf34
        menuItems: [
            {
                menuItem: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'MenuItem',
                    required: true,
                },
                quantity: {
                    type: Number,
<<<<<<< HEAD
=======
                    required: true,
>>>>>>> 2647102eec04afbcaae065ce958827a1d78edf34
                    default: 1,
                },
            },
        ],
<<<<<<< HEAD
        startDate: {
            type: Date,
            required: [true, 'Please add a start date'],
        },
        endDate: {
            type: Date,
            required: [true, 'Please add an end date'],
        },
        image: {
            type: String,
            default: 'no-deal-image.jpg',
        },
        isAvailable: {
=======
        isActive: {
>>>>>>> 2647102eec04afbcaae065ce958827a1d78edf34
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Deal', dealSchema);
