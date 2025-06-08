import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Container,
  Tabs,
  Tab,
  Stack,
  Alert,
} from '@mui/material';
import axios from '../utils/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Reservations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [roomRequests, setRoomRequests] = useState([]);
  const [bookRequests, setBookRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRequestsResponse, bookRequestsResponse] = await Promise.all([
        axios.get('/room-requests/user'),
        axios.get('/book-requests/my-requests')
      ]);
      setRoomRequests(roomRequestsResponse.data);
      setBookRequests(bookRequestsResponse.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderRoomRequests = () => (
    <Grid container spacing={3}>
      {roomRequests.length === 0 ? (
        <Grid item xs={12}>
          <Typography>No room bookings found</Typography>
        </Grid>
      ) : (
        roomRequests.map((request) => (
          <Grid item xs={12} sm={6} md={4} key={request._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {request.room.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Date: {new Date(request.date).toLocaleDateString()}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Purpose: {request.purpose}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status)}
                  />
                  {request.status === 'approved' && (
                    <Chip
                      label={request.isActive ? 'Active' : 'Inactive'}
                      color={request.isActive ? 'success' : 'default'}
                    />
                  )}
                  {request.leaveRequestStatus && (
                    <Chip
                      label={`Leave: ${request.leaveRequestStatus}`}
                      color={getStatusColor(request.leaveRequestStatus)}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );

  const renderBookRequests = () => (
    <Grid container spacing={3}>
      {bookRequests.length === 0 ? (
        <Grid item xs={12}>
          <Typography>No book requests found</Typography>
        </Grid>
      ) : (
        bookRequests.map((request) => (
          <Grid item xs={12} sm={6} md={4} key={request._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {request.book.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Author: {request.book.author}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Request Date: {new Date(request.requestDate).toLocaleDateString()}
                </Typography>
                {request.processedDate && (
                  <Typography color="textSecondary" gutterBottom>
                    Processed Date: {new Date(request.processedDate).toLocaleDateString()}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status)}
                  />
                  {request.returnStatus && (
                    <Chip
                      label={`Return: ${request.returnStatus}`}
                      color={getStatusColor(request.returnStatus)}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Reservations
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Room Bookings" />
          <Tab label="Book Requests" />
        </Tabs>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          {activeTab === 0 && renderRoomRequests()}
          {activeTab === 1 && renderBookRequests()}
        </>
      )}
    </Container>
  );
};

export default Reservations; 