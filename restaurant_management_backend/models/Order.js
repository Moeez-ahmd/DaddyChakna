const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: false,
        },
        customerName: {
            type: String,
        },
        staff: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        orderNumber: {
            type: String,
            unique: true
        },
        items: [
            {
                menuItem: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'MenuItem',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                priceAtPurchase: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        orderType: {
            type: String,
            enum: ['Delivery', 'Pickup', 'Dine In'],
            default: 'Pickup',
        },
        tableNumber: {
            type: String,
        },
        deliveryAddress: {
            type: String,
        },
        scheduledTime: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Delivered', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Unpaid', 'Paid'],
            default: 'Unpaid',
        },
    },
    {
        timestamps: true,
    }
);

// Auto-increment order number
orderSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }

    try {
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
        let nextNumber = 1;
        
        if (lastOrder && lastOrder.orderNumber) {
            nextNumber = parseInt(lastOrder.orderNumber) + 1;
        }

        this.orderNumber = nextNumber.toString().padStart(5, '0');
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Order', orderSchema);
