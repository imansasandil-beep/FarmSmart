require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// IMPORT ROUTES
const authRoute = require('./routes/auth');
const marketplaceRoute = require('./routes/marketplace');
const uploadRoute = require('./routes/upload');
const deliveryRoute = require('./routes/delivery');
const ordersRoute = require('./routes/orders');
const paymentsRoute = require('./routes/payments');
const reviewsRoute = require('./routes/reviews');
const notificationsRoute = require('./routes/notifications');
const messagesRoute = require('./routes/messages');

const app = express();

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(express.json()); // Allows us to parse JSON data
app.use(cors()); // Allows frontend to communicate with backend

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

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// 2. Basic Route (To test if server is alive)
app.get('/', (req, res) => {
  res.send('FarmSmart API is running...');
});

// 3. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});