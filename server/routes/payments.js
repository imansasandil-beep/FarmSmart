const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



// ============================================
// STRIPE CONNECT: SELLER ONBOARDING
// ============================================

/**
 * POST /api/payments/create-connect-account
 * Creates a new Stripe Express connected account for a seller.
 * This is the first step - seller clicks "Set Up Payments" in the app.
 */
router.post('/create-connect-account', async (req, res) => {
    try {
        const { sellerId } = req.body;

        if (!sellerId) {
            return res.status(400).json({ message: 'Seller ID is required' });
        }

        // Find the seller in our database
        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // If they already have a Stripe account, just return the onboarding link
        if (seller.stripeAccountId) {
            // Check if they still need to complete onboarding
            const account = await stripe.accounts.retrieve(seller.stripeAccountId);
            if (account.charges_enabled) {
                return res.status(200).json({
                    message: 'Stripe account already set up and active',
                    accountId: seller.stripeAccountId,
                    chargesEnabled: true,
                });
            }
            // Account exists but onboarding incomplete — generate new link
            const accountLink = await stripe.accountLinks.create({
                account: seller.stripeAccountId,
                refresh_url: `${req.protocol}://${req.get('host')}/api/payments/connect-onboarding-refresh?sellerId=${sellerId}`,
                return_url: `${req.protocol}://${req.get('host')}/api/payments/connect-onboarding-return?sellerId=${sellerId}`,
                type: 'account_onboarding',
            });
            return res.status(200).json({
                accountId: seller.stripeAccountId,
                onboardingUrl: accountLink.url,
                chargesEnabled: false,
            });
        }

        // Create a new Stripe Express connected account
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US', // Using US for test mode compatibility
            email: seller.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
            business_profile: {
                product_description: `Farmer selling agricultural products on FarmSmart`,
            },
            metadata: {
                farmsmartUserId: sellerId,
            },
        });

        // Save the Stripe account ID to the seller's profile
        seller.stripeAccountId = account.id;
        seller.stripeOnboardingStatus = 'pending';
        await seller.save();

        // Create an Account Link for Stripe-hosted onboarding
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${baseUrl}/api/payments/connect-onboarding-refresh?sellerId=${sellerId}`,
            return_url: `${baseUrl}/api/payments/connect-onboarding-return?sellerId=${sellerId}`,
            type: 'account_onboarding',
        });

        res.status(200).json({
            accountId: account.id,
            onboardingUrl: accountLink.url,
        });
    } catch (error) {
        console.error('Create Connect account error:', error.message || error);
        res.status(500).json({ message: error.message || 'Failed to create Stripe account' });
    }
});


/**
 * GET /api/payments/onboarding-link/:sellerId
 * Generates a fresh Account Link for a seller who needs to continue/retry onboarding.
 * Account Links expire after a few minutes, so we need this endpoint to generate new ones.
 */
router.get('/onboarding-link/:sellerId', async (req, res) => {
    try {
        const seller = await User.findById(req.params.sellerId);
        if (!seller || !seller.stripeAccountId) {
            return res.status(404).json({ message: 'Seller has no Stripe account. Create one first.' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const accountLink = await stripe.accountLinks.create({
            account: seller.stripeAccountId,
            refresh_url: `${baseUrl}/api/payments/connect-onboarding-refresh?sellerId=${req.params.sellerId}`,
            return_url: `${baseUrl}/api/payments/connect-onboarding-return?sellerId=${req.params.sellerId}`,
            type: 'account_onboarding',
        });

        res.status(200).json({ onboardingUrl: accountLink.url });
    } catch (error) {
        console.error('Onboarding link error:', error.message || error);
        res.status(500).json({ message: error.message || 'Failed to generate onboarding link' });
    }
});


/**
 * GET /api/payments/connect-status/:sellerId
 * Returns the seller's Stripe Connect status — used by the app to show onboarding progress.
 */
router.get('/connect-status/:sellerId', async (req, res) => {
    try {
        const seller = await User.findById(req.params.sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        if (!seller.stripeAccountId) {
            return res.status(200).json({
                hasStripeAccount: false,
                onboardingStatus: 'none',
                chargesEnabled: false,
                payoutsEnabled: false,
            });
        }

        // Fetch live status from Stripe
        const account = await stripe.accounts.retrieve(seller.stripeAccountId);

        // Update our local status if Stripe says they're fully onboarded
        if (account.charges_enabled && seller.stripeOnboardingStatus !== 'complete') {
            seller.stripeOnboardingStatus = 'complete';
            await seller.save();
        }

        res.status(200).json({
            hasStripeAccount: true,
            stripeAccountId: seller.stripeAccountId,
            onboardingStatus: seller.stripeOnboardingStatus,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
        });
    } catch (error) {
        console.error('Connect status error:', error.message || error);
        res.status(500).json({ message: error.message || 'Failed to check Connect status' });
    }
});



// ============================================
// CHECKOUT: STRIPE CONNECT DESTINATION CHARGES
// ============================================

/**
 * POST /api/payments/create-checkout-session
 * Creates a Stripe Checkout Session with DESTINATION CHARGES.
 * Money flows: Customer pays → Platform gets full amount → Transfer to seller's connected account
 * Platform keeps the application_fee_amount (our 2% commission)
 */
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { orderId, amount, productName, sellerId } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Order ID and amount are required' });
        }

        // Look up the seller to get their Stripe Connected Account ID
        let sellerStripeAccountId = null;
        if (sellerId) {
            const seller = await User.findById(sellerId);
            if (seller && seller.stripeAccountId) {
                // Verify the connected account can accept charges
                const account = await stripe.accounts.retrieve(seller.stripeAccountId);
                if (account.charges_enabled) {
                    sellerStripeAccountId = seller.stripeAccountId;
                }
            }
        }

        // If no sellerId was provided, try to get it from the order
        if (!sellerStripeAccountId) {
            const order = await Order.findById(orderId);
            if (order && order.sellerId) {
                const seller = await User.findById(order.sellerId);
                if (seller && seller.stripeAccountId) {
                    const account = await stripe.accounts.retrieve(seller.stripeAccountId);
                    if (account.charges_enabled) {
                        sellerStripeAccountId = seller.stripeAccountId;
                    }
                }
            }
        }

        if (!sellerStripeAccountId) {
            return res.status(400).json({
                message: 'Seller has not set up their Stripe payment account yet. Please ask the seller to complete Stripe onboarding.',
            });
        }

        // Build the base URL for success/cancel redirects
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Calculate the platform's application fee (2%)
        const platformFeePercent = parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENT) || 2;
        const applicationFeeAmount = Math.round(amount * 100 * (platformFeePercent / 100)); // in cents

        // Create a Stripe Checkout Session with DESTINATION CHARGES
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd', // Using USD for test mode
                    product_data: {
                        name: productName || 'FarmSmart Order',
                    },
                    unit_amount: Math.round(amount * 100), // Stripe uses cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            // ⭐ DESTINATION CHARGE: Route funds to seller's connected account
            payment_intent_data: {
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: sellerStripeAccountId,
                },
            },
            success_url: `${baseUrl}/api/payments/checkout-success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/api/payments/checkout-cancel?orderId=${orderId}`,
            metadata: { orderId, sellerId: sellerId || '' },
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



// ============================================
// REFUND: WITH REVERSE TRANSFER
// ============================================

/**
 * POST /api/payments/refund
 * Refunds a payment and reverses the transfer to the connected account.
 * With destination charges, we use reverse_transfer: true to pull funds back.
 */
router.post('/refund', async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Process refund through Stripe with reverse transfer
        if (order.stripePaymentIntentId) {
            // For Checkout Sessions, we need to retrieve the payment intent first
            try {
                const session = await stripe.checkout.sessions.retrieve(order.stripePaymentIntentId);
                if (session.payment_intent) {
                    await stripe.refunds.create({
                        payment_intent: session.payment_intent,
                        reverse_transfer: true, // Pull funds back from connected account
                    });
                }
            } catch (stripeError) {
                // If it's a payment intent ID directly
                await stripe.refunds.create({
                    payment_intent: order.stripePaymentIntentId,
                    reverse_transfer: true,
                });
            }
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



// ============================================
// WEBHOOKS
// ============================================

/**
 * POST /api/payments/webhook - Stripe webhook handler
 * Handles both payment events and Connect account events.
 */
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
            // ⭐ Checkout session completed — mark order as paid
            case 'checkout.session.completed': {
                const session = event.data.object;
                const orderId = session.metadata?.orderId;
                if (orderId) {
                    await Order.findByIdAndUpdate(orderId, {
                        paymentStatus: 'paid',
                        status: 'confirmed',
                    });
                    console.log(`✅ Order ${orderId} marked as paid via webhook`);
                }
                break;
            }

            // Payment intent succeeded (backup handler)
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata?.orderId;
                if (orderId) {
                    await Order.findByIdAndUpdate(orderId, {
                        paymentStatus: 'paid',
                        status: 'confirmed',
                    });
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const failedIntent = event.data.object;
                const failedOrderId = failedIntent.metadata?.orderId;
                if (failedOrderId) {
                    await Order.findByIdAndUpdate(failedOrderId, {
                        paymentStatus: 'failed',
                    });
                }
                break;
            }

            // ⭐ Connected account updated — check if onboarding is complete
            case 'account.updated': {
                const account = event.data.object;
                if (account.charges_enabled && account.metadata?.farmsmartUserId) {
                    await User.findByIdAndUpdate(account.metadata.farmsmartUserId, {
                        stripeOnboardingStatus: 'complete',
                    });
                    console.log(`✅ Seller ${account.metadata.farmsmartUserId} Stripe onboarding complete`);
                } else if (account.charges_enabled) {
                    // Try to find by stripeAccountId
                    await User.findOneAndUpdate(
                        { stripeAccountId: account.id },
                        { stripeOnboardingStatus: 'complete' }
                    );
                    console.log(`✅ Connected account ${account.id} onboarding complete`);
                }
                break;
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
});

module.exports = router;
