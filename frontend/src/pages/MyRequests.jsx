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
  Chip,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
} from '@mui/material';
import axios from '../utils/axios';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/book-requests/my-requests');
      setRequests(response.data);
    } catch (error) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handlePickupStatusChange = async (requestId, isPickedUp) => {
    try {
      await axios.put(`/book-requests/${requestId}/update-pickup`, { isPickedUp });
      setSuccess('Pickup status updated successfully');
      fetchRequests();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update pickup status');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        My Book Requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Book Title</TableCell>
              <TableCell>Request Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Pickup Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{request.book.title}</TableCell>
                <TableCell>
                  {new Date(request.requestDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={
                      request.status === 'approved' ? 'success' :
                      request.status === 'pending' ? 'warning' :
                      'error'
                    }
                  />
                </TableCell>
                <TableCell>
                  {request.status === 'approved' && !request.isReturned && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={request.isPickedUp}
                          onChange={(e) => handlePickupStatusChange(request._id, e.target.checked)}
                          disabled={request.isReturned}
                        />
                      }
                      label="Picked Up"
                    />
                  )}
                  {request.isPickedUp && (
                    <Typography variant="caption" display="block" color="textSecondary">
                      Picked up on: {new Date(request.pickupDate).toLocaleDateString()}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default MyRequests; 