const router = require('express').Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');
const { createNotification } = require('./notifications');

// Create a review (after order delivered)
router.post('/', async (req, res) => {
    try {
        const { orderId, reviewerId, rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if order exists and is delivered
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Can only review delivered orders' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ orderId });
        if (existingReview) {
            return res.status(400).json({ message: 'Order already reviewed' });
        }

        // Create review
        const review = new Review({
            orderId,
            reviewerId,
            sellerId: order.sellerId,
            listingId: order.listingId,
            rating,
            comment: comment || '',
        });

        await review.save();

        // Update seller's average rating
        const sellerReviews = await Review.find({ sellerId: order.sellerId });
        const avgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;

        await User.findByIdAndUpdate(order.sellerId, {
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: sellerReviews.length,
        });

        // Create notification for seller
        if (createNotification) {
            await createNotification(
                order.sellerId,
                'review_received',
                'New Review Received ⭐',
                `You received a ${rating}-star review!`,
                { orderId, rating }
            );
        }

        res.status(201).json({
            message: 'Review submitted successfully',
            review,
        });

    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get seller's reviews
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { limit = 20 } = req.query;

        const reviews = await Review.find({ sellerId })
            .populate('reviewerId', 'fullName')
            .populate('listingId', 'title')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const stats = await Review.aggregate([
            { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                },
            },
        ]);

        res.status(200).json({
            reviews,
            stats: stats[0] || { avgRating: 0, totalReviews: 0 },
        });

    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Check if order can be reviewed
router.get('/can-review/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ canReview: false, message: 'Order not found' });
        }

        const existingReview = await Review.findOne({ orderId });

        const canReview = order.status === 'delivered' && !existingReview;

        res.status(200).json({
            canReview,
            alreadyReviewed: !!existingReview,
        });

    } catch (error) {
        console.error('Can Review Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
