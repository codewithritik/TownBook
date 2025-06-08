import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Pagination,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Search as SearchIcon, CheckCircle as CheckCircleIcon, BorderAll } from '@mui/icons-material';
import axios from '../utils/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 6;

const Books = () => {
  const [allBooks, setAllBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [returnRequestDialogOpen, setReturnRequestDialogOpen] = useState(false);
  const [selectedBookForReturn, setSelectedBookForReturn] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const [booksResponse, requestsResponse] = await Promise.all([
          axios.get('/books'),
          axios.get('/book-requests/my-requests')
        ]);
        setAllBooks(booksResponse.data);
        setMyRequests(requestsResponse.data);
        setTotalPages(Math.ceil(booksResponse.data.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    // Filter books based on search term
    let filteredBooks = allBooks;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredBooks = allBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setBooks(filteredBooks.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredBooks.length / ITEMS_PER_PAGE));
  }, [allBooks, page, searchTerm]);

  const handleRequest = async (bookId) => {
    try {
      await axios.post('/book-requests', { bookId });
      setSuccess('Book request submitted successfully');
      setRequestDialogOpen(false);
      // Refresh requests immediately to show pending status
      const response = await axios.get('/book-requests/my-requests');
      setMyRequests(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleReturn = async (bookId) => {
    try {
      await axios.post(`/books/${bookId}/return`);
      setSuccess('Book returned successfully');
      // Refresh both books and requests data
      const [booksResponse, requestsResponse] = await Promise.all([
        axios.get('/books'),
        axios.get('/book-requests/my-requests')
      ]);
      setAllBooks(booksResponse.data);
      setMyRequests(requestsResponse.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to return book');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getRequestStatus = (bookId) => {
    const request = myRequests.find(req => req.book._id === bookId);
    if (!request) return null;
    
    if (request.status === 'pending') return 'pending';
    if (request.status === 'approved' && !request.isReturned) {
      if (request.returnStatus === 'pending') return 'return_pending';
      if (request.returnStatus === 'approved') return 'return_approved';
      return 'approved';
    }
    return null;
  };

  const isBookBorrowedByMe = (book) => {
    if (!user?.id) return false;
    const request = myRequests.find(req => 
      req.book._id === book._id && 
      req.status === 'approved' && 
      !req.isReturned &&
      req.returnStatus !== 'pending'
    );
    return !!request;
  };

  const canRequestBook = (book) => {
    if (!user) return false;
    
    // Check if user has any request for this book (pending or approved)
    const request = myRequests.find(req => 
      req.book._id === book._id && 
      (req.status === 'pending' || (req.status === 'approved' && !req.isReturned))
    );
    
    // Allow requesting if:
    // 1. Book has available copies
    // 2. User doesn't have any active request (pending or approved)
    return book.availableCopies > 0 && !request;
  };

  const handleReturnRequest = async (bookId) => {
    try {
      await axios.post(`/book-requests/${bookId}/return-request`);
      setSuccess('Return request submitted successfully');
      setReturnRequestDialogOpen(false);
      // Refresh requests to show new status
      const response = await axios.get('/book-requests/my-requests');
      setMyRequests(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const hasPendingRequest = (bookId) => {
    return myRequests.some(request => 
      request.book._id === bookId && 
      request.status === 'pending' && 
      !request.returnStatus
    );
  };

  const handleRequestClick = (book) => {
    setSelectedBook(book);
    setRequestDialogOpen(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/book-requests', {
        bookId: selectedBook._id,
        purpose: e.target.purpose.value
      });
      setSuccess('Book request submitted successfully');
      setRequestDialogOpen(false);
      // Refresh requests immediately to show pending status
      const response = await axios.get('/book-requests/my-requests');
      setMyRequests(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handlePickupStatusChange = async (requestId, isPickedUp) => {
    try {
      await axios.put(`/book-requests/${requestId}/update-pickup`, { isPickedUp });
      setSuccess('Pickup status updated successfully');
      // Refresh requests
      const response = await axios.get('/book-requests/my-requests');
      setMyRequests(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update pickup status');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="100%">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book Catalog
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      <Grid container spacing={3}>
        {books.map((book) => {
          const requestStatus = getRequestStatus(book._id);
          const isBorrowedByMe = isBookBorrowedByMe(book);
          const canRequest = canRequestBook(book);
          return (
            <Grid item xs={6} key={book._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {book.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {book.author}
                  </Typography>
                 
                  <Box sx={{ mt: 2 }}>
                    {book.availableCopies === 0 ? (
                      <Chip
                        label="Out of Stock"
                        color="error"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label={`Available: ${book.availableCopies}/${book.copies}`}
                        color="success"
                        size="small"
                      />
                    )}
                    {requestStatus && (
                      <>
                        <Chip
                          label={
                            requestStatus === 'pending' ? 'Request Pending' :
                            requestStatus === 'approved' ? 'Approved' :
                            requestStatus === 'return_pending' ? 'Return Pending' :
                            'Return Approved'
                          }
                          color={
                            requestStatus === 'pending' ? 'warning' :
                            requestStatus === 'approved' ? 'success' :
                            requestStatus === 'return_pending' ? 'warning' :
                            'success'
                          }
                          size="small"
                          sx={{ ml: 1 }}
                        />
                        {requestStatus === 'approved' && (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={myRequests.find(req => 
                                  req.book._id === book._id
                                )?.isPickedUp || false}
                                onChange={(e) => handlePickupStatusChange(
                                  myRequests.find(req => req.book._id === book._id)._id,
                                  e.target.checked
                                )}
                                disabled={myRequests.find(req => 
                                  req.book._id === book._id
                                )?.isReturned}
                              />
                            }
                            label="Picked Up"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  {isBorrowedByMe ? (
                    <Button
                      color='primary'
                      onClick={() => {
                        setSelectedBookForReturn(book);
                        setReturnRequestDialogOpen(true);
                      }}
                    >
                      Request Return
                    </Button>
                  ) : canRequest ? (
                    <Button
                      color='primary'
                      onClick={() => handleRequestClick(book)}
                    >
                      Request Book
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color='primary'
                      disabled
                    >
                      {requestStatus === 'pending' ? 'Request Pending' : 'Not Available'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          color='primary'
        />
      </Box>

      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)}>
        <DialogTitle>Request Book</DialogTitle>
        <form onSubmit={handleRequestSubmit}>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              {selectedBook?.title}
            </Typography>
            <TextField
              fullWidth
              label="Purpose"
              name="purpose"
              multiline
              rows={4}
              required
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Submit Request
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog 
        open={returnRequestDialogOpen} 
        onClose={() => setReturnRequestDialogOpen(false)}
      >
        <DialogTitle>Request Book Return</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to request returning "{selectedBookForReturn?.title}"?
            This request will need to be approved by a librarian.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnRequestDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleReturnRequest(selectedBookForReturn?._id)}
            color='primary'
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Books; 