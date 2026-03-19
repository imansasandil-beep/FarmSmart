const router = require('express').Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const { createNotification } = require('./notifications');

/**
 * Order Routes
 * Handles creating orders, fetching them for buyers/sellers,
 * and updating order status through its lifecycle.
 */

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
    try {
        const {
            buyerId, sellerId, listingId,
            quantity, unitPrice, subtotal,
            platformFeePercent, platformFee,
            deliveryFee, totalAmount, sellerPayout,
            deliveryAddress, paymentStatus, status,
            stripePaymentIntentId
        } = req.body;

        // Basic validation
        if (!buyerId || !sellerId || !listingId) {
            return res.status(400).json({ message: 'Missing required order fields' });
        }

        // Check if listing still has enough stock
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        if (listing.availableQuantity < quantity) {
            return res.status(400).json({
                message: `Only ${listing.availableQuantity} ${listing.unit} available`
            });
        }

        // Create the order
        const newOrder = new Order({
            buyerId, sellerId, listingId,
            quantity, unitPrice, subtotal,
            platformFeePercent: platformFeePercent || 2,
            platformFee, deliveryFee,
            totalAmount, sellerPayout,
            deliveryAddress,
            paymentStatus: paymentStatus || 'pending',
            status: status || 'pending',
            stripePaymentIntentId,
        });

        const savedOrder = await newOrder.save();

        // Reduce the listing's available quantity
        listing.availableQuantity -= quantity;
        if (listing.availableQuantity <= 0) {
            listing.isActive = false; // Auto-deactivate if sold out
        }
        await listing.save();

        // Notify the seller about the new order
        if (createNotification) {
            await createNotification(
                sellerId.toString(),
                'order',
                'New Order Received 🛒',
                `You have a new order for ${listing.title}`,
                { orderId: savedOrder._id, listingId }
            );
        }

        res.status(201).json({
            message: 'Order created successfully',
            order: savedOrder,
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/orders/buyer/:buyerId - Get all orders for a buyer
router.get('/buyer/:buyerId', async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.params.buyerId })
            .populate('listingId', 'title imageUrl unit price')
            .populate('sellerId', 'fullName')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/orders/seller/:sellerId - Get all orders for a seller
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const orders = await Order.find({ sellerId: req.params.sellerId })
            .populate('listingId', 'title imageUrl unit price')
            .populate('buyerId', 'fullName')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/orders/:id - Get a single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('listingId', 'title imageUrl unit price location')
            .populate('buyerId', 'fullName email')
            .populate('sellerId', 'fullName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/orders/:id/status - Update order status
// Used by sellers to mark orders as processing, shipped, etc.
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the status
        order.status = status;

        // If delivered, also update delivery status
        if (status === 'delivered') {
            order.deliveryStatus = 'delivered';
        }

        // If cancelled, restore the stock
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const listing = await Listing.findById(order.listingId);
            if (listing) {
                listing.availableQuantity += order.quantity;
                listing.isActive = true;
                await listing.save();
            }
        }

        await order.save();

        // Notify buyer about order status change
        if (createNotification) {
            const statusMessages = {
                'confirmed': 'Your order has been confirmed by the seller ✅',
                'processing': 'Your order is being processed 📦',
                'shipped': 'Your order has been shipped 🚚',
                'delivered': 'Your order has been delivered 🎉',
                'cancelled': 'Your order has been cancelled ❌',
            };
            await createNotification(
                order.buyerId.toString(),
                'order',
                `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                statusMessages[status] || `Your order status changed to ${status}`,
                { orderId: order._id }
            );
        }

        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/orders/:id/cancel - Cancel an order
router.put('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Can only cancel pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                message: 'Cannot cancel an order that is already being processed'
            });
        }

        order.status = 'cancelled';
        order.paymentStatus = 'refunded';

        // Restore the stock
        const listing = await Listing.findById(order.listingId);
        if (listing) {
            listing.availableQuantity += order.quantity;
            listing.isActive = true;
            await listing.save();
        }

        await order.save();
        res.status(200).json({ message: 'Order cancelled', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
