const router = require('express').Router();
const { requireClerkAuth } = require('../middleware/clerkAuth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// POST /api/posts - Create a new post
router.post('/', requireClerkAuth, async (req, res) => {
  try {
    const { content, authorName, image } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const post = new Post({
      author: req.clerkUserId,
      authorName: authorName || 'Anonymous Farmer',
      content: content.trim(),
      image: image || null,
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

module.exports = router;