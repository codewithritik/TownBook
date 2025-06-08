import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import axios from '../utils/axios';

const ApprovedRooms = () => {
  const [approvedRooms, setApprovedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApprovedRooms();
  }, []);

  const fetchApprovedRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/room-requests/approved');
      setApprovedRooms(response.data);
    } catch (error) {
      setError('Failed to fetch approved rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInStatus = async (requestId, isCheckedIn) => {
    try {
      await axios.put(`/room-requests/${requestId}/check-status`, { isCheckedIn });
      setSuccess('Check-in status updated successfully');
      fetchApprovedRooms();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update check-in status');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Approved Rooms
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

      <Grid container spacing={3}>
        {approvedRooms.map((request) => (
          <Grid item xs={12} sm={6} md={4} key={request._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {request.room.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Booked by: {request.user.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Date: {new Date(request.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Purpose: {request.purpose}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`Capacity: ${request.room.capacity}`}
                    color='primary'
                    size="small"
                  />
                  <Chip
                    label={request.isActive ? 'Active' : 'Inactive'}
                    color={request.isActive ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={request.isCheckedIn || false}
                      onChange={(e) => handleCheckInStatus(request._id, e.target.checked)}
                      disabled={!request.isActive}
                    />
                  }
                  label={request.isCheckedIn ? 'Checked In' : 'Check In'}
                />
                {request.isCheckedIn && (
                  <Typography variant="caption" color="textSecondary">
                    Checked in at: {new Date(request.checkInTime).toLocaleTimeString()}
                  </Typography>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ApprovedRooms; 