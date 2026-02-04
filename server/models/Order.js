const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    // Buyer and Seller
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },

    // Order Details
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },

    // Fees and Totals
    platformFeePercent: {
        type: Number,
        default: 2, // 2% platform fee
    },
    platformFee: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    sellerPayout: {
        type: Number,
        required: true,
    },

    // Payment Info
    stripePaymentIntentId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },

    // Delivery Info
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
    },
    uberDeliveryId: {
        type: String,
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'quoted', 'dispatched', 'picked_up', 'delivered', 'cancelled'],
        default: 'pending',
    },
    deliveryQuoteId: {
        type: String,
    },

    // Order Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },

}, {
    timestamps: true // Automatically manage createdAt and updatedAt
});

module.exports = mongoose.model('Order', OrderSchema);
