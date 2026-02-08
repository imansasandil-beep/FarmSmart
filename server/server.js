require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// IMPORT ROUTES
const authRoute = require('./routes/auth');
const marketplaceRoute = require('./routes/marketplace');
const paymentsRoute = require('./routes/payments');
const deliveryRoute = require('./routes/delivery');
const ordersRoute = require('./routes/orders');
const uploadRoute = require('./routes/upload');
const notificationsRoute = require('./routes/notifications');
const messagesRoute = require('./routes/messages');
const reviewsRoute = require('./routes/reviews');

const app = express();

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(express.json()); // Allows us to parse JSON data
app.use(cors()); // Allows frontend to communicate with backend

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/marketplace', marketplaceRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/delivery', deliveryRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/notifications', notificationsRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/reviews', reviewsRoute);

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// 2. Basic Route (To test if server is alive)F
app.get('/', (req, res) => {
  res.send('FarmSmart API is running...');
});

// 3. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});