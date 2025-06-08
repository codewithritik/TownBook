const express = require('express');
const router = express.Router();
const { auth, isLibrarian } = require('../middleware/auth');
const RoomRequest = require('../models/RoomRequest');
const Room = require('../models/Room');

// Get all room requests
router.get('/', auth, async (req, res) => {
  try {
    const requests = await RoomRequest.find()
      .populate('user', 'name email')
      .populate('room', 'name capacity')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room requests', error: error.message });
  }
});

// Get pending room requests
router.get('/pending', auth, async (req, res) => {
  try {
    const requests = await RoomRequest.find({ status: 'pending' })
      .populate('room', 'name capacity description')
      .populate('user', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
});

// Create a new room request
router.post('/', auth, async (req, res) => {
  try {
    const { roomId, purpose, date } = req.body;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room has available spots
    if (room.available <= 0) {
      return res.status(400).json({ message: 'No available spots in the room' });
    }

    // Check if user already has a pending request for this room on the same date
    const existingRequest = await RoomRequest.findOne({
      room: roomId,
      user: req.user._id,
      date: new Date(date),
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this room on this date' });
    }

    // Check if user already has an approved booking for this date
    const existingUserBooking = await RoomRequest.findOne({
      user: req.user._id,
      date: new Date(date),
      status: 'approved',
      isActive: true
    });

    if (existingUserBooking) {
      return res.status(400).json({ message: 'You already have a room booked for this date' });
    }

    // Check if room is already fully booked for the given date
    const existingBookings = await RoomRequest.countDocuments({
      room: roomId,
      date: new Date(date),
      status: 'approved',
      isActive: true
    });

    if (existingBookings >= room.capacity) {
      return res.status(400).json({ message: 'Room is fully booked for this date' });
    }

    const request = new RoomRequest({
      room: roomId,
      user: req.user._id,
      purpose,
      date: new Date(date)
    });
    await request.save();

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room request', error: error.message });
  }
});

// Process room request (librarian only)
router.put('/:id/process', auth, isLibrarian, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await RoomRequest.findById(req.params.id)
      .populate('room')
      .populate('user');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    if (status === 'approved') {
      // Check if room has available spots
      const room = await Room.findById(request.room._id);
      if (room.available <= 0) {
        return res.status(400).json({ message: 'No available spots in the room' });
      }

      // Increase current booking
      room.currentBooking += 1;
      await room.save();

      request.isActive = true;
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Request to leave a room
router.post('/:id/leave-request', auth, async (req, res) => {
  try {
    const request = await RoomRequest.findById(req.params.id)
      .populate('room')
      .populate('user');

    if (!request) {
      return res.status(404).json({ message: 'Room request not found' });
    }

    // Verify the request belongs to the current user
    if (request.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to leave this room' });
    }

    // Check if the request is approved and active
    if (request.status !== 'approved' || !request.isActive) {
      return res.status(400).json({ message: 'Room is not currently booked' });
    }

    // Check if there's already a pending leave request
    if (request.leaveRequestStatus === 'pending') {
      return res.status(400).json({ message: 'Leave request is already pending' });
    }

    // Update the request with leave request details
    request.leaveRequestStatus = 'pending';
    request.leaveRequestDate = new Date();
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting leave request', error: error.message });
  }
});

// Process leave request (librarian only)
router.put('/:id/process-leave', auth, isLibrarian, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await RoomRequest.findById(req.params.id)
      .populate('room')
      .populate('user');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.leaveRequestStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending leave request found' });
    }

    if (status === 'approved') {
      request.isActive = false;
      // Decrease current booking when leave is approved
      const room = await Room.findById(request.room._id);
      room.currentBooking -= 1;
      await room.save();
    }

    request.leaveRequestStatus = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error processing leave request', error: error.message });
  }
});

// Get user's room requests
router.get('/user', auth, async (req, res) => {
  try {
    const requests = await RoomRequest.find({ user: req.user._id })
      .populate('room', 'name capacity description')
      .populate('user', 'name email')
      .sort({ date: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user requests', error: error.message });
  }
});

// Update room check-in/check-out status
router.put('/:id/check-status', auth, async (req, res) => {
  try {
    const { isCheckedIn } = req.body;
    const request = await RoomRequest.findById(req.params.id)
      .populate('room')
      .populate('user');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Can only update check-in status for approved requests' });
    }

    request.isCheckedIn = isCheckedIn;
    if (isCheckedIn) {
      request.checkInTime = new Date();
    } else {
      request.checkOutTime = new Date();
    }
    
    await request.save();
    res.json({ message: 'Check-in status updated successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Error updating check-in status', error: error.message });
  }
});

// Add this new endpoint to get approved rooms
router.get('/approved', auth, async (req, res) => {
  try {
    const requests = await RoomRequest.find({ 
      status: 'approved',
      isActive: true
    })
      .populate('room', 'name capacity description')
      .populate('user', 'name email')
      .sort({ date: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved rooms', error: error.message });
  }
});

// Add this new endpoint to get check-in statistics
router.get('/check-in-stats', auth, async (req, res) => {
  try {
    const stats = await RoomRequest.aggregate([
      {
        $match: {
          status: 'approved',
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalCheckedIn: {
            $sum: { $cond: [{ $eq: ['$isCheckedIn', true] }, 1, 0] }
          },
          totalCheckedOut: {
            $sum: { $cond: [{ $eq: ['$isCheckedIn', false] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || { totalCheckedIn: 0, totalCheckedOut: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching check-in statistics', error: error.message });
  }
});

// Update the user-check-in-stats endpoint
router.get('/user-check-in-stats', auth, async (req, res) => {
  try {
    const stats = await RoomRequest.find({
      status: 'approved',
      isActive: true
    })
    .populate({
      path: 'user',
      select: 'name email'
    })
    .populate({
      path: 'room',
      select: 'name'
    })
    .sort({ checkInTime: -1 });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user check-in statistics', error: error.message });
  }
});

module.exports = router; 