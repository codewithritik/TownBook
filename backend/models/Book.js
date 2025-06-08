const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  copies: {
    type: Number,
    required: true,
    default: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 1
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  imageUrl: {
    type: String
  },
  borrowedBy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema); 