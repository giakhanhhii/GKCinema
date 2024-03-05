import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  EventSeat as SeatIcon,
  LocalMovies as MovieIcon,
} from '@mui/icons-material';
import { format, addHours } from 'date-fns';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import MovieTicket from '../components/MovieTicket';

interface Booking {
  bookingId: string;
  movie_title: string;
  start_time: string;
  screen_number: number;
  selectedSeats: string[];
  amount: number;
  status: string;
  created_at: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`booking-tabpanel-${index}`}
    aria-labelledby={`booking-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);


const BookingHistory: React.FC = () => {
  // ... (keep existing state and other functions)
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const bookingsData: Booking[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Booking;
        bookingsData.push({
          ...data,
          created_at: data.created_at?.toDate() || new Date()
        });
      });

      // Sort bookings by created_at in descending order
      bookingsData.sort((a, b) => b.created_at - a.created_at);
      
      setBookings(bookingsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const isUpcoming = (startTime: string) => {
    const movieStartTime = new Date(startTime);
    const now = new Date();
    
    // Consider a movie as "upcoming" if:
    // 1. It hasn't started yet, OR
    // 2. It started less than 3 hours ago (assuming max movie length)
    const movieEndTime = addHours(movieStartTime, 3);
    return movieEndTime > now;
  };

  const handleViewTicket = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const renderBookingCard = (booking: Booking) => (
    <Card
      key={booking.bookingId}
      sx={{
        display: 'flex',
        mb: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="h6" component="div">
              {booking.movie_title}
            </Typography>
            <Chip
              label={booking.status}
              color={getStatusColor(booking.status) as any}
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TimeIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {format(new Date(booking.start_time), 'PPp')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <SeatIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {booking.selectedSeats.join(', ')}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <Typography variant="subtitle1" component="div">
              Total: ${booking.amount.toFixed(2)}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handleViewTicket(booking);
              }}
            >
              View Ticket
            </Button>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const upcomingBookings = bookings.filter((booking) =>
    isUpcoming(booking.start_time)
  );
  const pastBookings = bookings.filter(
    (booking) => !isUpcoming(booking.start_time)
  );

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        My Bookings
      </Typography>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Upcoming" />
          <Tab label="Past Bookings" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {upcomingBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MovieIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No upcoming bookings found
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/movies')}
              >
                Browse Movies
              </Button>
            </Box>
          ) : (
            upcomingBookings.map(renderBookingCard)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {pastBookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No past bookings found
              </Typography>
            </Box>
          ) : (
            pastBookings.map(renderBookingCard)
          )}
        </TabPanel>
      </Paper>

      {selectedBooking && (
        <MovieTicket
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
        />
      )}
    </Container>
  );
};

export default BookingHistory;
