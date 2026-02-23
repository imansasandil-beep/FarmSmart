const router = require('express').Router();
const Notification = require('../models/Notification');

/**
 * Notification Routes
 * Handles creating, fetching, and managing user notifications.
 */

// POST /api/notifications - Create a notification
router.post('/', async (req, res) => {
    try {
        const { userId, type, title, message, data } = req.body;

        const notification = new Notification({
            userId,
            type: type || 'system',
            title,
            message,
            data: data || {},
        });

        await notification.save();
        res.status(201).json({ message: 'Notification created', notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/notifications/:userId - Get all notifications for a user
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(50); // Only show last 50 notifications
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/notifications/:userId/unread - Get unread count
router.get('/:userId/unread', async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.params.userId,
            read: false,
        });
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/notifications/:userId/read-all - Mark all notifications as read
router.put('/:userId/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.params.userId, read: false },
            { read: true }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/notifications/:userId/clear - Delete old read notifications
router.delete('/:userId/clear', async (req, res) => {
    try {
        await Notification.deleteMany({
            userId: req.params.userId,
            read: true,
        });
        res.status(200).json({ message: 'Read notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
