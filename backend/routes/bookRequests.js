const express = require('express');
const router = express.Router();
const { auth, isLibrarian } = require('../middleware/auth');
const BookRequest = require('../models/BookRequest');
const Book = require('../models/Book');

// Create a new book request
router.post('/', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book is available
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No copies available for borrowing' });
    }

    // Check if user already has a pending request for this book
    const existingRequest = await BookRequest.findOne({
      book: bookId,
      user: req.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this book' });
    }

    // Create new request
    const request = new BookRequest({
      book: bookId,
      user: req.user.id
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error creating book request', error: error.message });
  }
});

// Get all requests (librarian only) or user's requests
router.get('/', auth, async (req, res) => {
  try {
    const { returnStatus } = req.query;
    let query = {};
    
    // If user is not a librarian, only show their own requests
    if (req.user.role !== 'librarian') {
      query.user = req.user._id;
    }
    
    if (returnStatus) {
      query.returnStatus = returnStatus;
    }

    const requests = await BookRequest.find(query)
      .populate('book', 'title author')
      .populate('user', 'name email')
      .populate('processedBy', 'name')
      .sort({ requestDate: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Get user's requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await BookRequest.find({ user: req.user.id })
      .populate('book', 'title author')
      .sort({ requestDate: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// Process a request (librarian only)
router.put('/:id/process', auth, isLibrarian, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const request = await BookRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = status;
    request.processedDate = new Date();
    request.processedBy = req.user.id;
    request.reason = reason;

    if (status === 'approved') {
      const book = await Book.findById(request.book);
      if (book.availableCopies <= 0) {
        return res.status(400).json({ message: 'No copies available for borrowing' });
      }

      // Update book status
      book.availableCopies -= 1;
      book.borrowedBy = {
        user: request.user,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      };
      await book.save();
    }

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Submit return request
router.post('/:bookId/return-request', auth, async (req, res) => {
  try {
    const request = await BookRequest.findOne({
      book: req.params.bookId,
      user: req.user._id,
      status: 'approved',
      isReturned: false
    });
    
    if (!request) {
      return res.status(404).json({ message: 'No approved book request found' });
    }

    if (request.returnStatus === 'pending') {
      return res.status(400).json({ message: 'Return request is already pending' });
    }

    request.returnStatus = 'pending';
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting return request', error: error.message });
  }
});

// Process return request (librarian only)
router.put('/:requestId/process-return', auth, isLibrarian, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BookRequest.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.returnStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending return request found' });
    }

    if (status === 'approved') {
      request.isReturned = true;
      // Update book's available copies
      const book = await Book.findById(request.book);
      book.availableCopies += 1;
      await book.save();
    }

    request.returnStatus = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error processing return request', error: error.message });
  }
});

// Mark book as picked up
router.post('/:id/mark-picked-up', auth, async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id)
      .populate('book')
      .populate('user');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Can only mark approved requests as picked up' });
    }

    if (request.isPickedUp) {
      return res.status(400).json({ message: 'Book already marked as picked up' });
    }

    request.isPickedUp = true;
    request.pickupDate = new Date();
    await request.save();

    res.json({ message: 'Book marked as picked up successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Error marking book as picked up', error: error.message });
  }
});

// Update pickup status
router.put('/:id/update-pickup', auth, async (req, res) => {
  try {
    const { isPickedUp } = req.body;
    const request = await BookRequest.findById(req.params.id)
      .populate('book')
      .populate('user');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Can only update pickup status for approved requests' });
    }

    request.isPickedUp = isPickedUp;
    if (isPickedUp) {
      request.pickupDate = new Date();
    } else {
      request.pickupDate = null;
    }
    
    await request.save();
    res.json({ message: 'Pickup status updated successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pickup status', error: error.message });
  }
});

module.exports = router; 