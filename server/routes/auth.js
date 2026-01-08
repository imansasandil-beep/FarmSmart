const router = require('express').Router();
const User = require('../models/User'); // Import the blueprint we made
const bcrypt = require('bcryptjs'); // Import the security tool

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    // 1. Destructure the data sent from the app
    const { fullName, email, password, role } = req.body;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists!' });
    }

    // 3. Scramble the password (Hash it)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role, // 'farmer' or 'buyer'
    });

    // 5. Save to MongoDB
    const savedUser = await newUser.save();

    // 6. Send success message back to the app
    res.status(201).json({ message: 'User registered successfully!', userId: savedUser._id });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;