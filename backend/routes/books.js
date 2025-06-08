const express = require('express');
const router = express.Router();
const { auth, isLibrarian } = require('../middleware/auth');
const Book = require('../models/Book');
const BookRequest = require('../models/BookRequest');

// Get all books
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

// Get single book
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
});

// Add new book (librarian only)
router.post('/', auth, isLibrarian, async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
});

// Update book (librarian only)
router.put('/:id', auth, isLibrarian, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// Delete book (librarian only)
router.delete('/:id', auth, isLibrarian, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

// Borrow a book
router.post('/:id/borrow', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No copies available for borrowing' });
    }

    if (book.borrowedBy && book.borrowedBy.user === req.user.id) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    book.availableCopies -= 1;
    book.borrowedBy = {
      user: req.user.id,
      dueDate: dueDate,
    };

    await book.save();
    res.json({ message: 'Book borrowed successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Error borrowing book', error: error.message });
  }
});

// Return a book
router.post('/:id/return', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.borrowedBy || String(book.borrowedBy.user) !== String(req.user._id)) {
      return res.status(400).json({ message: 'You have not borrowed this book' });
    }

    // Find and update the corresponding book request
    const bookRequest = await BookRequest.findOne({
      book: book._id,
      user: req.user._id,
      status: 'approved',
      isReturned: false
    });

    if (bookRequest) {
      bookRequest.isReturned = true;
      await bookRequest.save();
    }

    book.availableCopies += 1;
    book.borrowedBy = null;

    await book.save();
    res.json({ message: 'Book returned successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Error returning book', error: error.message });
  }
});

// Increment book copies (librarian only)
router.post('/:id/increment-copies', auth, isLibrarian, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.copies += 1;
    book.availableCopies += 1;
    await book.save();
    res.json({ message: 'Book copies incremented successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Error incrementing book copies', error: error.message });
  }
});

// Decrement book copies (librarian only)
router.post('/:id/decrement-copies', auth, isLibrarian, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.copies <= 1) {
      return res.status(400).json({ message: 'Cannot have less than 1 copy of a book' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Cannot decrement copies when all are borrowed' });
    }

    book.copies -= 1;
    book.availableCopies -= 1;
    await book.save();
    res.json({ message: 'Book copies decremented successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Error decrementing book copies', error: error.message });
  }
});

module.exports = router; 