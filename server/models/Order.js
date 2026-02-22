const mongoose = require('mongoose');

/**
 * Order Schema
 * Tracks a purchase from start to finish - payment, delivery, everything.
 * 
 * Money flow:
 * Buyer pays: subtotal + platformFee + deliveryFee = totalAmount
 * Seller gets: sellerPayout (subtotal minus 2% commission)
 * We keep: platformFee (2%)
 */
const OrderSchema = new mongoose.Schema({
    // Who's buying and who's selling
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

    // What was ordered
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

    // Fee breakdown
    platformFeePercent: {
        type: Number,
        default: 2, // 2% platform commission
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

    // Stripe payment tracking
    stripePaymentIntentId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'refund_requested'],
        default: 'pending',
    },

    // Delivery details
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

    // Overall order lifecycle
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },

}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', OrderSchema);
