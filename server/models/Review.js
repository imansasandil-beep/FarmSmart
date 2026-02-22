const mongoose = require('mongoose');

// Review schema - buyers leave feedback after an order is delivered
const ReviewSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true, // One review per order only
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        maxlength: 500,
        default: '',
    },
}, {
    timestamps: true,
});

// For quick lookups of seller's reviews sorted by date
ReviewSchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
