const router = require('express').Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * Review Routes
 * Buyers can leave reviews after their order is delivered.
 * Reviews update the seller's average rating automatically.
 */

// POST /api/reviews - Create a new review
router.post('/', async (req, res) => {
    try {
        const { orderId, reviewerId, sellerId, listingId, rating, comment } = req.body;

        // Make sure the order exists and is delivered
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Can only review delivered orders' });
        }

        // Check if review already exists for this order
        const existingReview = await Review.findOne({ orderId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this order' });
        }

        // Create the review
        const review = new Review({
            orderId,
            reviewerId,
            sellerId,
            listingId,
            rating,
            comment: comment || '',
        });

        await review.save();

        // Update seller's average rating
        const allReviews = await Review.find({ sellerId });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / allReviews.length;

        await User.findByIdAndUpdate(sellerId, {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: allReviews.length,
        });

        res.status(201).json({
            message: 'Review submitted successfully',
            review,
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/reviews/seller/:sellerId - Get all reviews for a seller
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const reviews = await Review.find({ sellerId: req.params.sellerId })
            .populate('reviewerId', 'fullName')
            .populate('listingId', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/reviews/check/:orderId - Check if an order has been reviewed
router.get('/check/:orderId', async (req, res) => {
    try {
        const review = await Review.findOne({ orderId: req.params.orderId });
        res.status(200).json({
            reviewed: !!review,
            review: review || null,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
