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
        image: {
            type: String,
            default: 'no-deal-image.jpg',
        },
        menuItems: [
            {
                menuItem: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'MenuItem',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
            },
        ],
        startDate: {
            type: Date,
            required: [true, 'Please add a start date'],
        },
        endDate: {
            type: Date,
            required: [true, 'Please add an end date'],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Deal', dealSchema);
