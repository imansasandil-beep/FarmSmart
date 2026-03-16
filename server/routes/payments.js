const router = require('express').Router();
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { orderId, amount, productName } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Order ID and amount are required' });
        }

        // Build the base URL for success/cancel redirects
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Create a Stripe Checkout Session (hosted payment page)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'lkr',
                    product_data: {
                        name: productName || 'FarmSmart Order',
                    },
                    unit_amount: Math.round(amount * 100), // Stripe uses cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${baseUrl}/api/payments/checkout-success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/api/payments/checkout-cancel?orderId=${orderId}`,
            metadata: { orderId },
        });

        // Save the session ID to the order
        await Order.findByIdAndUpdate(orderId, {
            stripePaymentIntentId: session.id,
        });

        res.status(200).json({
            checkoutUrl: session.url,
            sessionId: session.id,
        });
    } catch (error) {
        console.error('Checkout session error:', error.message || error);
        res.status(500).json({ message: error.message || 'Failed to create checkout session' });
    }
});



// GET /api/payments/check-status/:orderId - Client polls this after browser closes
router.get('/check-status/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({
            paymentStatus: order.paymentStatus,
            status: order.status,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to check payment status' });
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
