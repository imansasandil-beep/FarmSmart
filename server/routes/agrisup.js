const router = require('express').Router();
const Question = require('../models/Question');
const User = require('../models/User');
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

// ============================================
// CREATE QUESTION - Farmers post new questions
// ============================================
router.post('/', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;
    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { title, body, category } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const newQuestion = new Question({
      title: title.trim(),
      body: body.trim(),
      category: category || 'General',
      authorId: clerkId,
      authorName: user.fullName,
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json({ question: savedQuestion });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// SUBMIT ANSWER - Experts answer questions
// ============================================
router.post('/:id/answer', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;
    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { body } = req.body;
    if (!body) {
      return res.status(400).json({ message: 'Answer body is required' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.answers.push({
      body: body.trim(),
      expertId: clerkId,
      expertName: user.fullName,
    });

    question.status = 'answered';
    const updatedQuestion = await question.save();

    res.status(201).json({ question: updatedQuestion });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;