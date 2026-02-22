const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'farmsmart/posts',
        resource_type: 'image',
        transformation: [
          { width: 1080, height: 1080, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// POST /api/posts - Create a new post
router.post('/', requireClerkAuth, upload.single('image'), async (req, res) => {
  try {
    const { content, authorName } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    let imageUrl = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Image upload failed:', uploadErr);
      }
    }
    if (!imageUrl && req.body.image) {
      imageUrl = req.body.image;
    }

    const post = new Post({
      author: req.clerkUserId,
      authorName: authorName || 'Anonymous Farmer',
      content: content.trim(),
      image: imageUrl,
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// GET /api/posts - Fetch post feed with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});


// GET /api/posts/:id - Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// POST /api/posts/:id/like - Toggle like on a post
router.post('/:id/like', requireClerkAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.clerkUserId;
    const alreadyLiked = post.likes.indexOf(userId);

    if (alreadyLiked === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(alreadyLiked, 1);
    }
    post.likesCount = post.likes.length;

    await post.save();
    res.json({
      liked: alreadyLiked === -1,
      likesCount: post.likesCount,
    });
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

// DELETE /api/posts/:id - Delete a post (author only)
router.delete('/:id', requireClerkAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author !== req.clerkUserId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Remove associated comments too
    await Comment.deleteMany({ postId: req.params.id });
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});
module.exports = router;