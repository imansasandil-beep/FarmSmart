const router = require('express').Router();
const Question = require('../models/Question');
const User = require('../models/User');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const { createNotification } = require('./notifications');

// ============================================
// GET ALL QUESTIONS - Accessible by all authenticated users
// Supports search query and category filter
// ============================================
router.get('/', requireClerkAuth, async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ];
    }

    const questions = await Question.find(filter)
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
// CREATE QUESTION - Only farmers can ask questions
// ============================================
router.post('/', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;

    // Verify the user is a farmer
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can ask questions' });
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

    // Send notification for the new question
    if (createNotification) {
      await createNotification(
        clerkId,
        'agrisup',
        'Question Posted ✅',
        `Your question "${title.trim().substring(0, 50)}" has been posted successfully`,
        { questionId: savedQuestion._id }
      );
    }

    res.status(201).json({ question: savedQuestion });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// SUBMIT ANSWER - Only agricultural experts can answer
// ============================================
router.post('/:id/answer', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;

    // Verify the user is an expert
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'expert') {
      return res.status(403).json({ message: 'Only agricultural experts can answer questions' });
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

    // Mark question as answered
    question.status = 'answered';
    const updatedQuestion = await question.save();

    // Notify the question author about the new answer
    if (createNotification) {
      await createNotification(
        question.authorId,
        'agrisup',
        'New Expert Answer 🎓',
        `${user.fullName} answered your question: "${question.title.substring(0, 50)}"`,
        { questionId: question._id }
      );
    }

    res.status(201).json({ question: updatedQuestion });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// DELETE QUESTION - Only the question author can delete
// ============================================
router.delete('/:id', requireClerkAuth, async (req, res) => {
  try {
    const clerkId = req.clerkUserId;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.authorId !== clerkId) {
      return res.status(403).json({ message: 'You can only delete your own questions' });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;