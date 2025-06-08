const mongoose = require('mongoose');

const roomRequestSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  leaveRequestStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
  leaveRequestDate: {
    type: Date
  },
  isCheckedIn: {
    type: Boolean,
    default: false
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  }
});

// Add index for efficient querying
roomRequestSchema.index({ room: 1, date: 1, status: 1 });
roomRequestSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('RoomRequest', roomRequestSchema); 