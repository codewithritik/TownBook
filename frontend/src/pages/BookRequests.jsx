import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  Alert,
} from '@mui/material';
import axios from '../utils/axios';

const BookRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/book-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch book requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (status) => {
    try {
      setError(null);
      await axios.put(`/book-requests/${selectedRequest._id}/process`, {
        status,
        reason: status === 'declined' ? reason : undefined
      });
      setProcessDialogOpen(false);
      setReason('');
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      setError('Failed to process request. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'declined':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book Requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
        <Alert severity="info">
          No pending book requests at the moment.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <Typography variant="subtitle2">{request.book.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {request.book.author}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{request.user.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {request.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(request.requestDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <Button
                        size="small"
                        color='primary'
                        onClick={() => {
                          setSelectedRequest(request);
                          setProcessDialogOpen(true);
                        }}
                      >
                        Process
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)}>
        <DialogTitle>Process Book Request</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Book: {selectedRequest?.book?.title}
          </Typography>
          <Typography gutterBottom>
            User: {selectedRequest?.user?.name}
          </Typography>
          {selectedRequest?.status === 'pending' && (
            <TextField
              fullWidth
              label="Reason (required for decline)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              margin="normal"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleProcess('approved')}
            color="success"
            variant="contained"
          >
            Approve
          </Button>
          <Button
            onClick={() => handleProcess('declined')}
            color="error"
            variant="contained"
            disabled={!reason}
          >
            Decline
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookRequests; 