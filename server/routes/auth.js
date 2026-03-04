const router = require('express').Router();
const User = require('../models/User'); // Import the blueprint we made
const bcrypt = require('bcryptjs'); // Import the security tool

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    // 1. Destructure the data sent from the app
    const { fullName, email, password, role } = req.body;

    // 2. Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // 3. Normalize email (trim and lowercase for consistency)
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists!' });
    }

    // 3. Scramble the password (Hash it)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create the new user
    const newUser = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
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

router.post('/login', async (req, res) => {
  try {
    // 1. Get email and password from the app
    const { email, password } = req.body;

    // 2. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // 3. Normalize email (trim and lowercase for consistency)
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Check if the user exists in the database
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 5. Check if the password matches the scrambled one in DB
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 6. Success! Remove the password from the data we send back
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;

    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REQUEST VERIFICATION - Sellers submit their ID to get verified
router.post('/request-verification', async (req, res) => {
  try {
    const { userId, idNumber, address } = req.body;

    if (!userId || !idNumber || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationStatus === 'pending') {
      return res.status(400).json({ message: 'Verification already pending' });
    }

    user.verificationStatus = 'pending';
    await user.save();

    res.status(200).json({ message: 'Verification request submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;