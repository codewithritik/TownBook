const express = require('express');
const router = express.Router();
const { auth, isLibrarian } = require('../middleware/auth');
const Room = require('../models/Room');
const RoomRequest = require('../models/RoomRequest');

// Create a new room (librarian only)
router.post('/', auth, isLibrarian, async (req, res) => {
  try {
    const { name, capacity, description } = req.body;
    const room = new Room({
      name,
      capacity,
      description
    });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
});

// Get all rooms with their current booking status
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

// Get single room with its current booking status
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error: error.message });
  }
});

// Update room (librarian only)
router.put('/:id', auth, isLibrarian, async (req, res) => {
  try {
    const { name, capacity, description } = req.body;
    
    // Get the current room to preserve currentBooking
    const currentRoom = await Room.findById(req.params.id);
    if (!currentRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // If capacity is being reduced, ensure it's not less than current bookings
    if (capacity && capacity < currentRoom.currentBooking) {
      return res.status(400).json({ 
        message: 'New capacity cannot be less than current number of bookings' 
      });
    }

    // Update room while preserving currentBooking
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      {
        name,
        capacity,
        description,
        currentBooking: currentRoom.currentBooking // Preserve current booking count
      },
      { new: true, runValidators: true }
    );

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
});

// Delete room (librarian only)
router.delete('/:id', auth, isLibrarian, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
});

module.exports = router; 