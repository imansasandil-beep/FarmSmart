const router = require('express').Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notifications');

// Send a message
router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId, text, listingId } = req.body;

        if (!senderId || !receiverId || !text) {
            return res.status(400).json({ message: 'Sender, receiver, and text are required' });
        }

        const conversationId = Message.getConversationId(senderId, receiverId);

        const message = new Message({
            senderId,
            receiverId,
            conversationId,
            text,
            listingId: listingId || null,
        });

        await message.save();

        // Create notification for receiver
        const sender = await User.findById(senderId);
        if (createNotification) {
            await createNotification(
                receiverId,
                'new_message',
                'New Message 💬',
                `${sender?.fullName || 'Someone'} sent you a message`,
                { conversationId, senderId }
            );
        }

        res.status(201).json({ message: 'Message sent', data: message });

    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get conversation messages
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;

        const query = { conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('senderId', 'fullName')
            .populate('receiverId', 'fullName');

        res.status(200).json({ messages: messages.reverse() });

    } catch (error) {
        console.error('Get Conversation Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get user's conversations
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get unique conversation IDs for user
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: new mongoose.Types.ObjectId(userId) },
                    { receiverId: new mongoose.Types.ObjectId(userId) }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessage: { $first: '$text' },
                    lastMessageDate: { $first: '$createdAt' },
                    senderId: { $first: '$senderId' },
                    receiverId: { $first: '$receiverId' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                                        { $eq: ['$read', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                },
            },
            {
                $sort: { lastMessageDate: -1 },
            },
        ]);

        // Get other user details for each conversation
        const conversationsWithUsers = await Promise.all(
            messages.map(async (conv) => {
                const otherUserId = conv.senderId.toString() === userId
                    ? conv.receiverId
                    : conv.senderId;
                const otherUser = await User.findById(otherUserId).select('fullName');
                return {
                    conversationId: conv._id,
                    otherUser: otherUser || { fullName: 'Unknown User' },
                    lastMessage: conv.lastMessage,
                    lastMessageDate: conv.lastMessageDate,
                    unreadCount: conv.unreadCount,
                };
            })
        );

        res.status(200).json({ conversations: conversationsWithUsers });

    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark messages as read
router.patch('/read/:conversationId/:userId', async (req, res) => {
    try {
        const { conversationId, userId } = req.params;

        await Message.updateMany(
            { conversationId, receiverId: userId, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'Messages marked as read' });

    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get or create conversation ID
router.get('/conversation-id/:userId1/:userId2', (req, res) => {
    const { userId1, userId2 } = req.params;
    const conversationId = Message.getConversationId(userId1, userId2);
    res.status(200).json({ conversationId });
});

module.exports = router;
