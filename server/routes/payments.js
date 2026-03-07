const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Payment Routes
 * Handles Stripe payment integration for the marketplace.
 * 
 * CURRENT MODE: Test mode (all payments go to platform account)
 * 
 * To switch to REAL MONEY MODE (Stripe Connect):
 *   1. Comment out the "TEST MODE" create-intent route below
 *   2. Uncomment the "STRIPE CONNECT MODE" create-intent route
 *   3. Uncomment the seller onboarding routes at the bottom
 *   4. Add STRIPE_CONNECT_CLIENT_ID to your .env file
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

// ============================================
// STRIPE CONNECT MODE - Real money split between seller & platform
// Uncomment this block and comment the TEST MODE block above
// ============================================

/*
// POST /api/payments/create-intent - Create payment with automatic split (STRIPE CONNECT)
router.post('/create-intent', async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Order ID and amount are required' });
        }

        // Get the order to find the seller
        const order = await Order.findById(orderId).populate('sellerId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if seller has a connected Stripe account
        const seller = await User.findById(order.sellerId);
        if (!seller || !seller.stripeAccountId) {
            return res.status(400).json({ 
                message: 'Seller has not set up their payment account. Please contact the seller.' 
            });
        }

        // Calculate the platform fee (what we keep)
        const platformFee = Math.round(order.platformFee * 100); // Convert to cents

        // Create payment intent with automatic transfer to seller
        // Stripe will automatically split: total goes to seller, minus application_fee_amount (our cut)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'lkr',
            metadata: { orderId },
            // This is the key part - tells Stripe to send money to the seller
            application_fee_amount: platformFee, // Platform keeps this amount
            transfer_data: {
                destination: seller.stripeAccountId, // Seller receives the rest
            },
        });

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
*/

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

// ============================================
// STRIPE CONNECT - Seller Onboarding Routes
// Uncomment these when switching to real money mode
// ============================================

/*
// POST /api/payments/seller/onboard - Create a Stripe Connected Account for seller
// This starts the onboarding process where the seller links their bank account
router.post('/seller/onboard', async (req, res) => {
    try {
        const { sellerId } = req.body;

        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If seller already has a Stripe account, check its status
        if (seller.stripeAccountId) {
            const account = await stripe.accounts.retrieve(seller.stripeAccountId);
            if (account.charges_enabled) {
                return res.status(200).json({ 
                    message: 'Account already set up',
                    accountStatus: 'active',
                });
            }
        }

        // Create a new Stripe Express connected account for the seller
        // Express accounts let Stripe handle the onboarding UI
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'LK', // Sri Lanka
            email: seller.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
            metadata: { sellerId: sellerId },
        });

        // Save the Stripe account ID to our database
        seller.stripeAccountId = account.id;
        await seller.save();

        // Create an onboarding link that takes the seller to Stripe's hosted form
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.APP_URL || 'farmsmart://'}stripe-refresh`,
            return_url: `${process.env.APP_URL || 'farmsmart://'}stripe-return`,
            type: 'account_onboarding',
        });

        res.status(200).json({
            onboardingUrl: accountLink.url, // Redirect seller to this URL
            accountId: account.id,
        });
    } catch (error) {
        console.error('Seller onboarding error:', error);
        res.status(500).json({ message: 'Failed to create seller account' });
    }
});

// GET /api/payments/seller/status/:sellerId - Check seller's Stripe account status
router.get('/seller/status/:sellerId', async (req, res) => {
    try {
        const seller = await User.findById(req.params.sellerId);
        if (!seller || !seller.stripeAccountId) {
            return res.status(200).json({ 
                accountStatus: 'not_created',
                message: 'Seller has not set up their payment account',
            });
        }

        // Check the account status with Stripe
        const account = await stripe.accounts.retrieve(seller.stripeAccountId);

        res.status(200).json({
            accountStatus: account.charges_enabled ? 'active' : 'pending',
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
        });
    } catch (error) {
        console.error('Seller status error:', error);
        res.status(500).json({ message: 'Failed to check account status' });
    }
});

// GET /api/payments/seller/dashboard/:sellerId - Get Stripe Express Dashboard link
// This lets sellers view their earnings, payouts, and bank info on Stripe's dashboard
router.get('/seller/dashboard/:sellerId', async (req, res) => {
    try {
        const seller = await User.findById(req.params.sellerId);
        if (!seller || !seller.stripeAccountId) {
            return res.status(400).json({ message: 'No Stripe account found' });
        }

        // Create a login link for the seller's Stripe Express dashboard
        const loginLink = await stripe.accounts.createLoginLink(seller.stripeAccountId);

        res.status(200).json({
            dashboardUrl: loginLink.url,
        });
    } catch (error) {
        console.error('Dashboard link error:', error);
        res.status(500).json({ message: 'Failed to create dashboard link' });
    }
});
*/

module.exports = router;
