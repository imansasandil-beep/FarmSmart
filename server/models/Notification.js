const mongoose = require('mongoose');

// Notification schema - keeps users informed about order updates, reviews, etc.
const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['order', 'payment', 'delivery', 'review', 'message', 'system'],
        default: 'system',
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // Flexible data field for linking to orders, etc.
        default: {},
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Notification', NotificationSchema);
