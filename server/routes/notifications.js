const router = require('express').Router();
const Notification = require('../models/Notification');

// Create a notification (internal use)
const createNotification = async (userId, type, title, message, data = {}) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            data,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Create Notification Error:', error);
        return null;
    }
};

// Get user's notifications
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, unreadOnly = false } = req.query;

        const query = { userId };
        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({ userId, read: false });

        res.status(200).json({
            notifications,
            unreadCount,
        });

    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Marked as read', notification });

    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark all as read
router.patch('/read-all/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany(
            { userId, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Mark All Read Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete old notifications (cleanup)
router.delete('/cleanup/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const result = await Notification.deleteMany({
            userId,
            createdAt: { $lt: thirtyDaysAgo },
            read: true,
        });

        res.status(200).json({
            message: `Deleted ${result.deletedCount} old notifications`
        });

    } catch (error) {
        console.error('Cleanup Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Export both router and helper function
module.exports = router;
module.exports.createNotification = createNotification;
