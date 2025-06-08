const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  returnStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  isPickedUp: {
    type: Boolean,
    default: false
  },
  pickupDate: {
    type: Date
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String
  }
});

module.exports = mongoose.model('BookRequest', bookRequestSchema); 