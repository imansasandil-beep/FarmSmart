const router = require('express').Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { createNotification } = require('./notifications');

// Initialize Stripe only if key is configured
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey && stripeKey !== 'sk_test_YOUR_STRIPE_SECRET_KEY'
    ? require('stripe')(stripeKey)
    : null;

const PLATFORM_FEE_PERCENT = parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT) || 2;

// Create a Payment Intent for checkout
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { listingId, quantity, deliveryFee, buyerId } = req.body;

        // Validate input
        if (!listingId || !quantity || !buyerId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get listing details
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.availableQuantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Calculate amounts
        const subtotal = listing.price * quantity;
        const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100));
        const deliveryAmount = deliveryFee || 0;
        const totalAmount = subtotal + platformFee + deliveryAmount;
        const sellerPayout = subtotal - platformFee;

        let paymentIntentId = null;
        let clientSecret = null;
        let useDevMode = false;

        // Stripe minimum is ~$0.50 USD, which is about Rs. 160
        const MINIMUM_STRIPE_AMOUNT_LKR = 160;

        // If Stripe is configured AND amount meets minimum, create real payment intent
        if (stripe && totalAmount >= MINIMUM_STRIPE_AMOUNT_LKR) {
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(totalAmount * 100), // Convert to cents
                    currency: 'lkr', // Sri Lankan Rupees
                    metadata: {
                        listingId: listingId,
                        buyerId: buyerId,
                        sellerId: listing.sellerId.toString(),
                        quantity: quantity,
                        platformFee: platformFee,
                        sellerPayout: sellerPayout,
                    },
                });
                paymentIntentId = paymentIntent.id;
                clientSecret = paymentIntent.client_secret;
            } catch (stripeError) {
                console.log('Stripe error, falling back to dev mode:', stripeError.message);
                useDevMode = true;
            }
        } else {
            useDevMode = true;
            if (stripe && totalAmount < MINIMUM_STRIPE_AMOUNT_LKR) {
                console.log(`Order amount Rs. ${totalAmount} below minimum (Rs. ${MINIMUM_STRIPE_AMOUNT_LKR}), using dev mode`);
            }
        }

        // Dev mode - simulate payment
        if (useDevMode) {
            paymentIntentId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Create order (with paid status in dev mode since no actual payment)
        const order = new Order({
            buyerId,
            sellerId: listing.sellerId,
            listingId,
            quantity,
            unitPrice: listing.price,
            subtotal,
            platformFeePercent: PLATFORM_FEE_PERCENT,
            platformFee,
            deliveryFee: deliveryAmount,
            totalAmount,
            sellerPayout,
            stripePaymentIntentId: paymentIntentId,
            paymentStatus: stripe ? 'pending' : 'paid', // Auto-paid in dev mode
            status: stripe ? 'pending' : 'confirmed', // Auto-confirmed in dev mode
        });

        await order.save();

        // In dev mode, also reduce stock immediately
        if (!stripe) {
            await Listing.findByIdAndUpdate(listingId, {
                $inc: { availableQuantity: -quantity }
            });
        }

        res.status(200).json({
            clientSecret: clientSecret,
            orderId: order._id,
            devMode: !stripe,
            breakdown: {
                subtotal,
                platformFee,
                deliveryFee: deliveryAmount,
                total: totalAmount,
            },
        });

    } catch (error) {
        console.error('Payment Intent Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Stripe Webhook to handle payment events
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle specific events
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            // Update order status
            const order = await Order.findOne({
                stripePaymentIntentId: paymentIntent.id
            });

            if (order) {
                order.paymentStatus = 'paid';
                order.status = 'confirmed';
                await order.save();

                // Reduce available quantity
                await Listing.findByIdAndUpdate(order.listingId, {
                    $inc: { availableQuantity: -order.quantity }
                });

                // Get listing details for notification
                const listing = await Listing.findById(order.listingId);
                const itemName = listing ? listing.title : 'item';

                // Notify Buyer
                if (createNotification) {
                    await createNotification(
                        order.buyerId,
                        'order_paid',
                        'Payment Successful ✅',
                        `Your payment for ${itemName} has been confirmed!`,
                        { orderId: order._id }
                    );

                    // Notify Seller
                    await createNotification(
                        order.sellerId,
                        'new_sale',
                        'New Sale! 💰',
                        `You sold ${order.quantity} of ${itemName}`,
                        { orderId: order._id }
                    );
                }
            }
            break;

        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;
            await Order.findOneAndUpdate(
                { stripePaymentIntentId: failedIntent.id },
                { paymentStatus: 'failed', status: 'cancelled' }
            );
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Manual payment confirmation (fallback when webhooks not configured)
router.post('/confirm-payment/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Already paid - no action needed
        if (order.paymentStatus === 'paid') {
            return res.status(200).json({ message: 'Payment already confirmed' });
        }

        // Verify with Stripe if we have a payment intent
        if (stripe && order.stripePaymentIntentId && !order.stripePaymentIntentId.startsWith('dev_')) {
            try {
                const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

                if (paymentIntent.status !== 'succeeded') {
                    return res.status(400).json({
                        message: `Payment not successful. Status: ${paymentIntent.status}`
                    });
                }
            } catch (stripeError) {
                console.error('Error verifying payment:', stripeError);
                // Continue anyway if Stripe verification fails
            }
        }

        // Update order status
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();

        // Reduce stock
        await Listing.findByIdAndUpdate(order.listingId, {
            $inc: { availableQuantity: -order.quantity }
        });

        // Get listing details for notification
        const listing = await Listing.findById(order.listingId);
        const itemName = listing ? listing.title : 'item';

        // Notify Buyer
        if (createNotification) {
            await createNotification(
                order.buyerId,
                'order_paid',
                'Payment Successful ✅',
                `Your payment for ${itemName} has been confirmed!`,
                { orderId: order._id }
            );

            // Notify Seller
            await createNotification(
                order.sellerId,
                'new_sale',
                'New Sale! 💰',
                `You sold ${order.quantity} of ${itemName}`,
                { orderId: order._id }
            );
        }

        res.status(200).json({
            message: 'Payment confirmed',
            order: {
                _id: order._id,
                paymentStatus: order.paymentStatus,
                status: order.status
            }
        });

    } catch (error) {
        console.error('Confirm Payment Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get seller earnings summary
router.get('/seller-balance/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        const orders = await Order.find({
            sellerId,
            paymentStatus: 'paid'
        });

        const totalEarnings = orders.reduce((sum, order) => sum + order.sellerPayout, 0);
        const totalOrders = orders.length;
        const pendingOrders = await Order.countDocuments({
            sellerId,
            paymentStatus: 'pending'
        });

        res.status(200).json({
            totalEarnings,
            totalOrders,
            pendingOrders,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Request refund
router.post('/refund/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentStatus !== 'paid') {
            return res.status(400).json({
                message: 'Can only refund paid orders'
            });
        }

        if (order.status === 'delivered') {
            return res.status(400).json({
                message: 'Cannot refund delivered orders. Please contact support.'
            });
        }

        if (order.paymentStatus === 'refund_requested' || order.paymentStatus === 'refunded') {
            return res.status(400).json({
                message: 'Refund already requested or processed'
            });
        }

        // If Stripe payment, process actual refund
        if (stripe && order.stripePaymentIntentId && !order.stripePaymentIntentId.startsWith('dev_')) {
            try {
                await stripe.refunds.create({
                    payment_intent: order.stripePaymentIntentId,
                });
                order.paymentStatus = 'refunded';
                order.status = 'cancelled';

                // Restore stock
                await Listing.findByIdAndUpdate(order.listingId, {
                    $inc: { availableQuantity: order.quantity }
                });

                await order.save();
                return res.status(200).json({
                    message: 'Refund processed successfully'
                });
            } catch (stripeError) {
                console.error('Stripe refund error:', stripeError);
                return res.status(500).json({
                    message: 'Failed to process refund through Stripe'
                });
            }
        }

        // For dev mode or non-Stripe payments, just mark as refund requested
        order.paymentStatus = 'refund_requested';
        await order.save();

        res.status(200).json({
            message: 'Refund request submitted. Seller will be notified.'
        });

    } catch (error) {
        console.error('Refund Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
