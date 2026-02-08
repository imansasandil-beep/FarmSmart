const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['order_placed', 'order_paid', 'order_shipped', 'order_delivered',
            'new_sale', 'refund_requested', 'refund_processed', 'review_received',
            'verification_approved', 'verification_rejected', 'new_message', 'system'],
        required: true,
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
        type: mongoose.Schema.Types.Mixed, // Can store orderId, listingId, etc.
        default: {},
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
