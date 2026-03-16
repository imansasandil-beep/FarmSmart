const router = require('express').Router();
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Payment Routes
 * Handles Stripe payment integration for the marketplace.
 *
 * CURRENT MODE: Test mode (all payments go to platform account)
 * 
 * To switch to REAL MONEY MODE (Stripe Connect):
 *   1. Uncomment the Stripe Connect create-intent route below
 *   2. Comment out the test mode create-intent route
 *   3. Add STRIPE_CONNECT_CLIENT_ID to your .env file
 *
 * Flow:
 * 1. Client requests a payment intent
 * 2. Stripe returns a client secret
 * 3. Client confirms payment using Stripe SDK
 * 4. Webhook confirms payment and we update the order
 */

// ============================================
// TEST MODE - Payment goes to platform account
// ============================================

// POST /api/payments/create-intent - Create a Stripe payment intent (TEST MODE)
router.post('/create-intent', async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Order ID and amount are required' });
        }

        // Create Stripe payment intent - money goes to YOUR platform account
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe uses cents
            currency: 'lkr', // Sri Lankan Rupees
            metadata: { orderId },
        });

        // Save the payment intent ID to the order
        await Order.findByIdAndUpdate(orderId, {
            stripePaymentIntentId: paymentIntent.id,
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
});

// POST /api/payments/confirm - Confirm payment after Stripe processes it
router.post('/confirm', async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();

        res.status(200).json({
            message: 'Payment confirmed',
            order,
        });
    } catch (error) {
        console.error('Payment confirm error:', error);
        res.status(500).json({ message: 'Failed to confirm payment' });
    }
});

// POST /api/payments/refund - Process a refund through Stripe
router.post('/refund', async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Process refund through Stripe
        if (order.stripePaymentIntentId) {
            await stripe.refunds.create({
                payment_intent: order.stripePaymentIntentId,
            });
        }

        order.paymentStatus = 'refunded';
        order.status = 'cancelled';
        await order.save();

        res.status(200).json({
            message: 'Refund processed',
            order,
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ message: 'Failed to process refund' });
    }
});

// GET /api/payments/seller-balance/:sellerId - Get seller's earnings
router.get('/seller-balance/:sellerId', async (req, res) => {
    try {
        const orders = await Order.find({
            sellerId: req.params.sellerId,
            paymentStatus: 'paid',
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
        });

        const totalEarnings = orders.reduce((sum, order) => sum + order.sellerPayout, 0);
        const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
        const completedOrders = orders.filter(o => o.status === 'delivered').length;

        res.status(200).json({
            totalEarnings,
            pendingOrders,
            completedOrders,
            totalOrders: orders.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/payments/webhook - Stripe webhook handler
router.post('/webhook', async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return res.status(400).json({ message: 'Webhook Error' });
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata.orderId;
                if (orderId) {
                    await Order.findByIdAndUpdate(orderId, {
                        paymentStatus: 'paid',
                        status: 'confirmed',
                    });
                }
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                const failedOrderId = failedIntent.metadata.orderId;
                if (failedOrderId) {
                    await Order.findByIdAndUpdate(failedOrderId, {
                        paymentStatus: 'failed',
                    });
                }
                break;
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
});

module.exports = router;
