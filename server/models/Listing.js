const mongoose = require('mongoose');

/**
 * Listing Schema
 * This represents a product that a farmer wants to sell on the marketplace.
 * Each listing is tied to a seller (user) and contains all the info
 * buyers need to make a purchase decision.
 */
const ListingSchema = new mongoose.Schema({
    // Who's selling this? We need to track the owner
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Basic product info - the stuff buyers care about most
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    // Display quantity like "10 kg" or "5 bags"
    quantity: {
        type: String,
        required: true,
    },
    // Actual stock count - decreases when someone buys
    availableQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    // kg, pieces, bags, bundles, etc.
    unit: {
        type: String,
        default: 'kg',
    },
    description: {
        type: String,
        default: '',
    },
    // Categories help buyers filter - crops, vegetables, fruits, etc.
    category: {
        type: String,
        default: 'crops',
    },

    // Where to pick up the goods - needed for delivery calculations
    // This is a nested object since addresses have multiple parts
    pickupAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'Sri Lanka' },
    },
    // Simple location string for display (e.g., "Kandy, Central Province")
    location: {
        type: String,
        default: '',
    },

    // Product image - using a placeholder if seller doesn't upload one
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150/1a4d45/6fdfc4?text=Crop',
    },

    // Soft delete - instead of removing listings, we just mark them inactive
    // This way we can still show them in order history
    isActive: {
        type: Boolean,
        default: true,
    },

    // When was this listing created? Useful for sorting "newest first"
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    // Let Mongoose handle createdAt and updatedAt automatically
    timestamps: true
});

module.exports = mongoose.model('Listing', ListingSchema);
