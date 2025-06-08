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
  Button,
} from '@mui/material';
import axios from '../utils/axios';

const MyRoomRequests = () => {
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
      const response = await axios.get('/room-requests/my-requests');
      setRequests(response.data);
    } catch (error) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInStatusChange = async (requestId, isCheckedIn) => {
    try {
      await axios.put(`/room-requests/${requestId}/update-checkin`, { isCheckedIn });
      setSuccess('Check-in status updated successfully');
      fetchRequests();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update check-in status');
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        My Room Reservations
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
              <TableCell>Room</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Check-in Status</TableCell>
              <TableCell>Check-in/Check-out Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{request.room.name}</TableCell>
                <TableCell>
                  {new Date(request.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{request.purpose}</TableCell>
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
                  {request.status === 'approved' && request.isActive && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={request.isCheckedIn}
                          onChange={(e) => handleCheckInStatusChange(request._id, e.target.checked)}
                          disabled={!request.isActive}
                        />
                      }
                      label={request.isCheckedIn ? "Checked In" : "Check In"}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {request.isCheckedIn && (
                    <Box>
                      <Typography variant="caption" display="block">
                        Check-in: {formatDateTime(request.checkInTime)}
                      </Typography>
                      {request.checkOutTime && (
                        <Typography variant="caption" display="block">
                          Check-out: {formatDateTime(request.checkOutTime)}
                        </Typography>
                      )}
                    </Box>
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

export default MyRoomRequests; 