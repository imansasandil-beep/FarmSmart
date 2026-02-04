const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
    // Seller reference
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Product Details
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: String,
        required: true,
    },
    availableQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    unit: {
        type: String,
        default: 'kg', // kg, pieces, bags, etc.
    },
    description: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        default: 'crops',
    },

    // Pickup Location (for Uber Direct)
    pickupAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'Sri Lanka' },
    },
    location: {
        type: String,
        default: '',
    },

    // Image
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150/1a4d45/6fdfc4?text=Crop',
    },

    // Status
    isActive: {
        type: Boolean,
        default: true,
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true // Automatically manage createdAt and updatedAt
});

module.exports = mongoose.model('Listing', ListingSchema);
