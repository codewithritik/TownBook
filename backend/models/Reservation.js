const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['book', 'room'],
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  roomSlot: {
    startTime: Date,
    endTime: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
  isPickedUp: {
    type: Boolean,
    default: false
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reservation', reservationSchema); 