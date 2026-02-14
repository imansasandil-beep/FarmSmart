const router = require('express').Router();
const { requireClerkAuth } = require('../middleware/clerkAuth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// TODO: add post endpoints here

module.exports = router;