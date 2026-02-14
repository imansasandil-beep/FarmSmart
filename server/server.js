require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// IMPORT ROUTES
const authRoute = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json()); // Allows us to parse JSON data
app.use(cors()); // Allows frontend to communicate with backend

// Route Middlewares
app.use('/api/user', authRoute);

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