import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  Book as BookIcon,
  CalendarToday as ReservationIcon,
} from '@mui/icons-material';
import SensorDoorIcon from '@mui/icons-material/SensorDoor';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && user.role !== 'member') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const features = [
    {
      title: 'Books Search',
      description: 'Search for books by title, author',
      icon: <BookIcon sx={{ fontSize: 40, color: '#008D86' }} />,
      path: '/books',
    },
    {
      title: 'My Reservations',
      description: 'View and manage your current reservations',
      icon: <ReservationIcon sx={{ fontSize: 40, color: '#008D86' }} />,
      path: '/reservations',
    },
    {
      title: 'Reading Rooms',
      description: 'Reserve a quiet space for reading and studying',
      icon: <SensorDoorIcon sx={{ fontSize: 40, color: '#008D86' }} />,
      path: '/rooms',
    },
    {
      title: 'Reservation History',
      description: 'Review your past book and room reservations ',
      icon: <AccessTimeIcon sx={{ fontSize: 40, color: '#008D86' }} />,
      path: '/reservations',
    },
  ];

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome{user?.name ? `, ${user.name}` : ''}!
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
      Community Library Reservation & Reading Room Scheduler
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
      Browse available titles, reserve books or study rooms, and manage all your reservations in one place.
      </Typography>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {features.map((feature) => (
          <Grid size={6} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2, color: 'primary.main' }}>{feature.icon}</Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(feature.path)}
                  fullWidth
                  sx={{
                    backgroundColor: '#008D86',
                    '&:hover': {
                      backgroundColor: '#008D86',
                    },
                  }}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home; 