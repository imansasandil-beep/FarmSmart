const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
  },
  expertId: {
    type: String,
    required: true,
  },
  expertName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Crops', 'Livestock', 'Soil', 'Pest Control', 'Irrigation', 'General'],
    default: 'General',
  },
  authorId: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  answers: [AnswerSchema],
  status: {
    type: String,
    enum: ['open', 'answered'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

QuestionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Question', QuestionSchema);