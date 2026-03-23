const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Clerk user ID - links this MongoDB doc to the Clerk user
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'expert'],
    default: 'farmer',
  },
  // Farm details
  district: {
    type: String,
    default: '',
  },
  farmLocation: {
    type: String,
    default: '',
  },
  farmSize: {
    type: Number,
    default: 0,
  },
  primaryCrops: {
    type: [String],
    default: [],
  },
  farmingZone: {
    type: String,
    enum: ['', 'Wet Zone', 'Dry Zone', 'Intermediate Zone'],
    default: '',
  },
  // Seller verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
  // Stripe Connect (for sellers receiving payouts)
  stripeAccountId: {
    type: String,
    default: null,
  },
  stripeOnboardingStatus: {
    type: String,
    enum: ['none', 'pending', 'complete'],
    default: 'none',
  },
  // Ratings (for sellers)
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);