const router = require('express').Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');

// Create new order (called after delivery quote, before payment)
router.post('/create', async (req, res) => {
    try {
        const {
            buyerId,
            listingId,
            quantity,
            deliveryAddress,
            deliveryFee,
            deliveryQuoteId
        } = req.body;

        // Validate
        if (!buyerId || !listingId || !quantity || !deliveryAddress) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.availableQuantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Calculate amounts
        const subtotal = listing.price * quantity;
        const platformFeePercent = 2;
        const platformFee = Math.round(subtotal * (platformFeePercent / 100));
        const totalAmount = subtotal + platformFee + (deliveryFee || 0);
        const sellerPayout = subtotal - platformFee;

        const order = new Order({
            buyerId,
            sellerId: listing.sellerId,
            listingId,
            quantity,
            unitPrice: listing.price,
            subtotal,
            platformFeePercent,
            platformFee,
            deliveryFee: deliveryFee || 0,
            totalAmount,
            sellerPayout,
            deliveryAddress,
            deliveryQuoteId,
            status: 'pending',
            paymentStatus: 'pending',
            deliveryStatus: 'pending',
        });

        await order.save();

        res.status(201).json({
            orderId: order._id,
            breakdown: {
                subtotal,
                platformFee,
                deliveryFee: deliveryFee || 0,
                total: totalAmount,
            },
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get buyer's orders
router.get('/buyer/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ buyerId: userId })
            .populate('listingId', 'title imageUrl price')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get seller's orders
router.get('/seller/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ sellerId: userId })
            .populate('listingId', 'title imageUrl price')
            .populate('buyerId', 'fullName')
            .sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single order details
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('listingId', 'title imageUrl price pickupAddress')
            .populate('sellerId', 'fullName')
            .populate('buyerId', 'fullName');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel order (only if not yet paid)
router.post('/:orderId/cancel', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                message: 'Cannot cancel paid orders. Please contact support for refunds.'
            });
        }

        order.status = 'cancelled';
        order.paymentStatus = 'failed';
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
