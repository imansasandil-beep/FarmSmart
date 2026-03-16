const router = require('express').Router();
const User = require('../models/User');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const { getAuth } = require('@clerk/express');

// ============================================
// SYNC PROFILE - Called after Clerk sign-up
// Creates a MongoDB user linked to the Clerk user
// ============================================
router.post('/sync-profile', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;
    const { fullName, email, phone, role } = req.body;

    // Validate input
    if (!fullName || !email) {
      return res.status(400).json({ message: 'fullName and email are required' });
    }

    // Check if user profile already exists by clerkId OR email (for older accounts)
    let user = await User.findOne({
      $or: [{ clerkId }, { email: email.trim().toLowerCase() }]
    });

    if (user) {
      // If found by email but clerkId is missing/different, link them
      if (user.clerkId !== clerkId) {
        user.clerkId = clerkId;
        await user.save();
      }

      // User already exists, return their profile
      return res.status(200).json({
        message: 'Profile already exists/linked',
        user: user.toObject(),
      });
    }

    // Create new user profile in MongoDB
    const newUser = new User({
      clerkId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      role: role || 'farmer',
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'Profile created successfully!',
      user: savedUser.toObject(),
    });
  } catch (err) {
    console.error('Sync profile error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// GET PROFILE - Fetch the authenticated user's profile
// ============================================
router.get('/profile', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.status(200).json({ user: user.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// REQUEST VERIFICATION - Sellers submit their ID to get verified
// ============================================
router.post('/request-verification', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;
    const { idNumber, address } = req.body;

    if (!idNumber || !address) {
      return res.status(400).json({ message: 'ID number and address are required' });
    }

    const user = await User.findOne({ clerkId });
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

// ============================================
// UPDATE PROFILE - Update the authenticated user's profile
// ============================================
router.put('/update-profile', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;
    const { fullName, phone, role } = req.body;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone;
    if (role && ['farmer', 'buyer', 'expert'].includes(role)) user.role = role;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: user.toObject(),
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;