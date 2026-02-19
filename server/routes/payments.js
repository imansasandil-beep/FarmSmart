const router = require('express').Router();
const Order = require('../models/Order');

/**
 * Payment Routes
 * Handles Stripe payment integration for the marketplace.
 * 
 * In dev mode: we skip actual Stripe calls and simulate payments.
 * In production: this creates real payment intents and processes webhooks.
 * 
 * Flow:
 * 1. Client requests a payment intent
 * 2. Stripe returns a client secret
 * 3. Client confirms payment using Stripe SDK
 * 4. Webhook confirms payment and we update the order
 */

// Check if Stripe is configured
const stripe = process.env.STRIPE_SECRET_KEY
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;

if (!stripe) {
    console.log('⚠️  Stripe not configured - payments will run in dev mode');
}

// POST /api/payments/create-intent - Create a Stripe payment intent
router.post('/create-intent', async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Order ID and amount are required' });
        }

        // Dev mode: skip Stripe entirely
        if (!stripe) {
            return res.status(200).json({
                clientSecret: 'dev_mode_secret',
                paymentIntentId: `dev_pi_${Date.now()}`,
                devMode: true,
                message: 'Dev mode: no real payment processed',
            });
        }

        // Production: create real Stripe payment intent
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
            devMode: false,
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
});

// POST /api/payments/confirm - Confirm payment (dev mode shortcut)
router.post('/confirm', async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Mark as paid
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

// POST /api/payments/refund - Process a refund
router.post('/refund', async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // In production with Stripe configured
        if (stripe && order.stripePaymentIntentId && !order.stripePaymentIntentId.startsWith('dev_')) {
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
        // Sum up all completed orders for this seller
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
// In production, Stripe sends events here when payment status changes
router.post('/webhook', async (req, res) => {
    try {
        // In dev mode, just acknowledge
        if (!stripe) {
            return res.status(200).json({ received: true });
        }

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
