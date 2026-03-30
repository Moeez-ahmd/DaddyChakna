const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // A user should only have 1 active cart document
        },
        items: [
            {
                menuItem: {
                    type: mongoose.Schema.ObjectId,
                    refPath: 'items.itemType',
                    required: true,
                },
                itemType: {
                    type: String,
                    required: true,
                    enum: ['MenuItem', 'Deal'],
                    default: 'MenuItem',
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Cart', cartSchema);
