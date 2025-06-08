const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentBooking: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual property for available spots
roomSchema.virtual('available').get(function() {
  return this.capacity - (this.currentBooking || 0);
});

// Pre-save middleware to ensure currentBooking doesn't exceed capacity
roomSchema.pre('save', function(next) {
  if (!this.currentBooking) {
    this.currentBooking = 0;
  }
  if (this.currentBooking > this.capacity) {
    this.currentBooking = this.capacity;
  }
  next();
});

// Ensure virtuals are included when converting to JSON
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema); 