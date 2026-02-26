const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Conversation ID is created from sorted user IDs
    conversationId: {
        type: String,
        required: true,
        index: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 1000,
    },
    read: {
        type: Boolean,
        default: false,
    },
    // Optional reference to listing being discussed
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
    },
}, {
    timestamps: true,
});

// Indexes for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

// Helper to generate conversation ID from two user IDs
MessageSchema.statics.getConversationId = function (userId1, userId2) {
    return [userId1, userId2].sort().join('_');
};

module.exports = mongoose.model('Message', MessageSchema);
