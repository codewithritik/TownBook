import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Container,
  CardActions,
  Stack,
  Paper,
  Snackbar,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import axios from '../utils/axios';
import { useSelector } from 'react-redux';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');
  const [userRequests, setUserRequests] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (selectedDate) {
      fetchRooms();
      fetchUserRequests();
    }
  }, [selectedDate]);

  const fetchUserRequests = async () => {
    try {
      const response = await axios.get('/room-requests/user');
      setUserRequests(response.data);
    } catch (error) {
      console.error('Error fetching user requests:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/rooms?date=${selectedDate.toISOString()}`);
      setRooms(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch rooms');
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRoom = async () => {
    try {
      await axios.post('/room-requests', {
        roomId: selectedRoom._id,
        date: selectedDate,
        purpose
      });
      setRequestDialogOpen(false);
      setPurpose('');
      setRequestSuccess('Room request submitted successfully');
      fetchRooms();
      fetchUserRequests();
    } catch (error) {
      setRequestError(error.response?.data?.message || 'Failed to request room');
    }
  };

  const isRoomBookedByUser = (roomId) => {
    return userRequests.some(request => 
      request.room._id === roomId && 
      request.status === 'approved' && 
      request.isActive
    );
  };

  const isRoomRequestedByUser = (room) => {
    return userRequests.some(request => 
      request.room._id === room._id && 
      request.status === 'pending' && 
      new Date(request.date).toDateString() === selectedDate.toDateString()
    );
  };

  const hasPendingLeaveRequest = (room) => {
    return userRequests.some(request => 
      request.room._id === room._id && 
      request.status === 'approved' && 
      request.leaveRequestStatus === 'pending' &&
      new Date(request.date).toDateString() === selectedDate.toDateString()
    );
  };

  const hasApprovedLeaveRequest = (roomId) => {
    return userRequests.some(request => 
      request.room._id === roomId && 
      request.status === 'approved' && 
      request.leaveRequestStatus === 'approved' && 
      request.isActive
    );
  };

  const getRoomStatus = (room) => {
    const userRequest = userRequests.find(request => 
      request.room._id === room._id && 
      request.status === 'approved' && 
      request.isActive
    );

    if (userRequest) {
      if (userRequest.leaveRequestStatus === 'pending') {
        return 'Leave Request Pending';
      }
      if (userRequest.leaveRequestStatus === 'approved') {
        return 'Leave Approved';
      }
      return 'Booked';
    }
    return room.available > 0 ? 'Available' : 'Fully Booked';
  };

  const getRoomStatusColor = (room) => {
    const userRequest = userRequests.find(request => 
      request.room._id === room._id && 
      request.status === 'approved' && 
      request.isActive
    );

    if (userRequest) {
      if (userRequest.leaveRequestStatus === 'pending') {
        return 'warning';
      }
      if (userRequest.leaveRequestStatus === 'approved') {
        return 'info';
      }
      return 'success';
    }
    return room.available > 0 ? 'success' : 'error';
  };

  const handleLeaveRequest = async (room) => {
    try {
      const userRequest = userRequests.find(request => 
        request.room._id === room._id && 
        request.status === 'approved' && 
        request.isActive
      );

      if (!userRequest) {
        setSnackbar({
          open: true,
          message: 'No active booking found for this room',
          severity: 'error'
        });
        return;
      }

      await axios.post(`/room-requests/${userRequest._id}/leave-request`);
      setSnackbar({
        open: true,
        message: 'Leave request submitted successfully',
        severity: 'success'
      });
      fetchUserRequests();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit leave request',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCheckInStatus = async (requestId, isCheckedIn) => {
    try {
      console.log('Sending request:', { requestId, isCheckedIn }); // Debug log
      const response = await axios.put(`/room-requests/${requestId}/check-status`, { 
        isCheckedIn: isCheckedIn 
      });
      console.log('Response:', response.data); // Debug log
      
      // Update the local state immediately after successful API call
      setUserRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { 
                ...request, 
                isCheckedIn: isCheckedIn,
                checkInTime: isCheckedIn ? new Date() : request.checkInTime,
                checkOutTime: !isCheckedIn ? new Date() : request.checkOutTime
              } 
            : request
        )
      );
      
      setSnackbar({
        open: true,
        message: `Room ${isCheckedIn ? 'checked in' : 'checked out'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error:', error.response?.data || error); // Debug log
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update check-in status',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rooms
        </Typography>
        {requestSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setRequestSuccess('')}>
            {requestSuccess}
          </Alert>
        )}
        {requestError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setRequestError('')}>
            {requestError}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            minDate={new Date()}
          />
        </LocalizationProvider>
      </Box>

      {selectedDate && (
        <Grid container spacing={3}>
          {rooms.map((room) => {
            const isBooked = isRoomBookedByUser(room._id);
            const isRequested = isRoomRequestedByUser(room);
            const hasLeaveRequest = hasPendingLeaveRequest(room);
            const hasApprovedLeave = hasApprovedLeaveRequest(room._id);

            return (
              <Grid item xs={12} sm={6} md={4} key={room._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {room.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Capacity: {room.capacity}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Available Spots: {room.available}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={`${room.available}/${room.capacity} Available`}
                        color={room.available > 0 ? 'success' : 'error'}
                      />
                      {isBooked && (
                        <Chip
                          label="Booked by You"
                          color="success"
                        />
                      )}
                      {isRequested && (
                        <Chip
                          label="Request Pending"
                          color="warning"
                        />
                      )}
                      {hasLeaveRequest && (
                        <Chip
                          label="Leave Request Pending"
                          color="warning"
                        />
                      )}
                      {hasApprovedLeave && (
                        <Chip
                          label="Leave Approved"
                          color="info"
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="textSecondary">
                      {room.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {isRoomBookedByUser(room._id) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={userRequests.find(req => 
                                req.room._id === room._id && 
                                req.status === 'approved' && 
                                req.isActive
                              )?.isCheckedIn ?? false}
                              onChange={(e) => {
                                const request = userRequests.find(req => 
                                  req.room._id === room._id && 
                                  req.status === 'approved' && 
                                  req.isActive
                                );
                                if (request) {
                                  handleCheckInStatus(request._id, e.target.checked);
                                }
                              }}
                            />
                          }
                          label={userRequests.find(req => 
                            req.room._id === room._id && 
                            req.status === 'approved' && 
                            req.isActive
                          )?.isCheckedIn ? "Checked In" : "Check In"}
                        />
                        {userRequests.find(req => 
                          req.room._id === room._id && 
                          req.status === 'approved' && 
                          req.isActive
                        )?.isCheckedIn && (
                          <Typography variant="caption" color="textSecondary">
                            Checked in at: {new Date(userRequests.find(req => 
                              req.room._id === room._id && 
                              req.status === 'approved' && 
                              req.isActive
                            ).checkInTime).toLocaleTimeString()}
                          </Typography>
                        )}
                      </Box>
                    )}
                    {isBooked && !hasLeaveRequest ? (
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleLeaveRequest(room)}
                      >
                        Request Leave
                      </Button>
                    ) : (!isBooked && !isRequested && !hasLeaveRequest && room.available > 0) || hasApprovedLeave ? (
                      <Button
                        variant="contained"
                        color='primary'
                        onClick={() => {
                          setSelectedRoom(room);
                          setRequestDialogOpen(true);
                        }}
                      >
                        Request Room
                      </Button>
                    ) : null}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)}>
        <DialogTitle>Request Room</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Purpose"
              multiline
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRequestRoom} variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Rooms; 