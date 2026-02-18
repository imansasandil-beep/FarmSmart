const router = require('express').Router();
const Question = require('../models/Question');
const { requireClerkAuth } = require('../middleware/clerkAuth');

// ============================================
// GET ALL QUESTIONS - Accessible by all authenticated users
// ============================================
router.get('/', requireClerkAuth, async (req, res) => {
  try {
    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ questions });
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// GET SINGLE QUESTION BY ID
// ============================================
router.get('/:id', requireClerkAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).lean();

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ question });
  } catch (err) {
    console.error('Get question error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;