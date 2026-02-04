const router = require('express').Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');

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

        // If Stripe is configured, create real payment intent
        if (stripe) {
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
        } else {
            // Development mode - simulate payment
            paymentIntentId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            console.log('⚠️ Stripe not configured - running in development mode');
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

module.exports = router;
