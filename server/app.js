require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');

// IMPORT ROUTES
const authRoute = require('./routes/auth');
const marketplaceRoute = require('./routes/marketplace');
const uploadRoute = require('./routes/upload');
const deliveryRoute = require('./routes/delivery');
const ordersRoute = require('./routes/orders');
const paymentsRoute = require('./routes/payments');
const reviewsRoute = require('./routes/reviews');
const { router: notificationsRoute } = require('./routes/notifications');
const messagesRoute = require('./routes/messages');
const pestDiseaseRoute = require('./routes/pestDiseases');
const weatherRoute = require('./routes/weather');
const agrisupRoute = require('./routes/agrisup');
const postsRoute = require('./routes/posts');

const app = express();

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Stripe checkout browser redirects (no auth needed, must be before Clerk middleware)
app.get('/api/payments/checkout-success', async (req, res) => {
    try {
        const { orderId } = req.query;
        if (orderId) {
            const Order = require('./models/Order');
            await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', status: 'confirmed' });
        }
        res.send(`
            <html><head><meta name="viewport" content="width=device-width, initial-scale=1">
            <style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0a1f1c;color:white}.c{text-align:center;padding:40px}.i{font-size:64px;margin-bottom:20px}h1{color:#6fdfc4}p{color:rgba(255,255,255,0.7);font-size:16px}</style>
            </head><body><div class="c"><div class="i">✅</div><h1>Payment Successful!</h1><p>Your order has been confirmed.</p><p>You can close this window and return to the FarmSmart app.</p></div></body></html>
        `);
    } catch (error) {
        res.status(500).send('Error processing payment');
    }
});

app.get('/api/payments/checkout-cancel', (req, res) => {
    res.send(`
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1">
        <style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0a1f1c;color:white}.c{text-align:center;padding:40px}.i{font-size:64px;margin-bottom:20px}h1{color:#ff6b6b}p{color:rgba(255,255,255,0.7);font-size:16px}</style>
        </head><body><div class="c"><div class="i">❌</div><h1>Payment Cancelled</h1><p>You can close this window and return to the app.</p></div></body></html>
    `);
});

// Stripe Connect onboarding: seller returns after completing onboarding
app.get('/api/payments/connect-onboarding-return', (req, res) => {
    res.send(`
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1">
        <style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0a1f1c;color:white}.c{text-align:center;padding:40px}.i{font-size:64px;margin-bottom:20px}h1{color:#6fdfc4}p{color:rgba(255,255,255,0.7);font-size:16px}</style>
        </head><body><div class="c"><div class="i">✅</div><h1>Stripe Setup Complete!</h1><p>Your payment account is being verified.</p><p>You can close this window and return to the FarmSmart app.</p></div></body></html>
    `);
});

// Stripe Connect onboarding: link expired or needs refresh
app.get('/api/payments/connect-onboarding-refresh', async (req, res) => {
    const { sellerId } = req.query;
    res.send(`
        <html><head><meta name="viewport" content="width=device-width, initial-scale=1">
        <style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0a1f1c;color:white}.c{text-align:center;padding:40px}.i{font-size:64px;margin-bottom:20px}h1{color:#f59e0b}p{color:rgba(255,255,255,0.7);font-size:16px}</style>
        </head><body><div class="c"><div class="i">🔄</div><h1>Link Expired</h1><p>This onboarding link has expired.</p><p>Please close this window and tap "Set Up Payments" again in the app.</p></div></body></html>
    `);
});

// Middleware
app.use(express.json()); // Allows us to parse JSON data
app.use(cors()); // Allows frontend to communicate with backend
app.use(clerkMiddleware()); // Clerk auth - inspects requests for session tokens

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/marketplace', marketplaceRoute); // Marketplace listings API
app.use('/api/upload', uploadRoute); // Image uploads
app.use('/api/delivery', deliveryRoute); // Delivery fee calculation
app.use('/api/orders', ordersRoute); // Order management
app.use('/api/payments', paymentsRoute); // Payment processing
app.use('/api/reviews', reviewsRoute); // Seller reviews
app.use('/api/notifications', notificationsRoute); // User notifications
app.use('/api/messages', messagesRoute); // Chat messaging
app.use('/api/pest-diseases', pestDiseaseRoute); // Pest & diseases
app.use('/api/weather', weatherRoute); // Weather forecast
app.use('/api/agrisup', agrisupRoute); // AgriSup Q&A
app.use('/api/posts', postsRoute); // Community posts

// Basic Route (To test if server is alive)
app.get('/', (req, res) => {
  res.send('FarmSmart API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
