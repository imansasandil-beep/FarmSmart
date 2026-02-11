const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  image: {
    type: String,
    default: null,
  },
  likes: [{
    type: String,
  }],
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', PostSchema);