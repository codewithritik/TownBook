const express = require('express');
const router = express.Router();
const { auth, isLibrarian } = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const Room = require('../models/Room');

// Get all reservations (librarian) or user's reservations (member)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'member') {
      query.user = req.user._id;
    }
    
    const reservations = await Reservation.find(query)
      .populate('book')
      .populate('room')
      .populate('user', 'name email');
    
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

// Create new reservation
router.post('/', auth, async (req, res) => {
  try {
    const { type, book, room, roomSlot, pickupDate, returnDate } = req.body;

    // Validate reservation type
    if (type === 'book' && !book) {
      return res.status(400).json({ message: 'Book ID is required for book reservations' });
    }
    if (type === 'room' && (!room || !roomSlot)) {
      return res.status(400).json({ message: 'Room ID and slot are required for room reservations' });
    }

    // Check book availability
    if (type === 'book') {
      const bookDoc = await Book.findById(book);
      if (!bookDoc || bookDoc.availableCopies <= 0) {
        return res.status(400).json({ message: 'Book is not available' });
      }
    }

    // Check room availability
    if (type === 'room') {
      const roomDoc = await Room.findById(room);
      const slot = roomDoc.availableSlots.find(s => 
        s.startTime.getTime() === new Date(roomSlot.startTime).getTime() &&
        s.endTime.getTime() === new Date(roomSlot.endTime).getTime() &&
        s.isAvailable
      );
      if (!slot) {
        return res.status(400).json({ message: 'Room slot is not available' });
      }
    }

    const reservation = new Reservation({
      user: req.user._id,
      type,
      book,
      room,
      roomSlot,
      pickupDate,
      returnDate
    });

    await reservation.save();

    // Update availability
    if (type === 'book') {
      await Book.findByIdAndUpdate(book, { $inc: { availableCopies: -1 } });
    } else if (type === 'room') {
      await Room.updateOne(
        { _id: room, 'availableSlots.startTime': roomSlot.startTime },
        { $set: { 'availableSlots.$.isAvailable': false } }
      );
    }

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
});

// Update reservation status (librarian only)
router.put('/:id/status', auth, isLibrarian, async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = status;
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation', error: error.message });
  }
});

// Mark as picked up/checked in
router.put('/:id/pickup', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'librarian') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reservation.isPickedUp = true;
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation', error: error.message });
  }
});

// Mark as returned/checked out
router.put('/:id/return', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'librarian') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reservation.isReturned = true;
    await reservation.save();

    // Update availability
    if (reservation.type === 'book') {
      await Book.findByIdAndUpdate(reservation.book, { $inc: { availableCopies: 1 } });
    } else if (reservation.type === 'room') {
      await Room.updateOne(
        { _id: reservation.room, 'availableSlots.startTime': reservation.roomSlot.startTime },
        { $set: { 'availableSlots.$.isAvailable': true } }
      );
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation', error: error.message });
  }
});

module.exports = router; 