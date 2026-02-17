const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const { requireClerkAuth } = require('../middleware/clerkAuth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage for image uploads
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

// Helper to stream buffer to Cloudinary
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

// POST /api/posts - Create a new post (with optional image)
router.post('/', requireClerkAuth, upload.single('image'), async (req, res) => {
  try {
    const { content, authorName } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    let imageUrl = null;

    // Handle direct file upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Image upload failed:', uploadErr);
      }
    }

    // Fallback: accept pre-uploaded image URL
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

module.exports = router;