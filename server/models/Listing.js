const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
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
    description: {
        type: String,
        default: '',
    },
    sellerName: {
        type: String,
        default: '',
    },
    sellerPhone: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        default: '',
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150/1a4d45/6fdfc4?text=Crop',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Listing', ListingSchema);
