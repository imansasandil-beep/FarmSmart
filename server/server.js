require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// IMPORT ROUTES
const authRoute = require('./routes/auth');
const marketplaceRoute = require('./routes/marketplace');
const uploadRoute = require('./routes/upload');

const app = express();

// Middleware
app.use(express.json()); // Allows us to parse JSON data
app.use(cors()); // Allows frontend to communicate with backend

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/marketplace', marketplaceRoute); // Marketplace listings API
app.use('/api/upload', uploadRoute); // Image uploads

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