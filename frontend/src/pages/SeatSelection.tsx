import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { EventSeat as SeatIcon } from '@mui/icons-material';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { format } from 'date-fns';

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'booked' | 'selected';
  created_at: string;
  updated_at: string;
}

interface SeatRow {
  row: string;
  seats: Seat[];
}

interface ShowtimeDetails {
  movie_title: string;
  price: number;
  screen_number: number;
  start_time: Timestamp;
  end_time: Timestamp;
  available_seats: number;
  total_seats: number;
}

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [seatRows, setSeatRows] = useState<SeatRow[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showtimeDetails, setShowtimeDetails] = useState<ShowtimeDetails | null>(null);

  useEffect(() => {
    if (!showtimeId) {
      setError('Invalid showtime');
      setLoading(false);
      return;
    }

    // Get showtime details
    const showtimeRef = doc(db, 'showtimes', showtimeId);
    const unsubscribeShowtime = onSnapshot(showtimeRef, 
      (doc) => {
        if (!doc.exists()) {
          setError('Showtime not found');
          setLoading(false);
          return;
        }

        const data = doc.data();
        setShowtimeDetails({
          movie_title: data.movie_title,
          price: data.price,
          screen_number: data.screen_number,
          start_time: data.start_time,
          end_time: data.end_time,
          available_seats: data.available_seats,
          total_seats: data.total_seats
        });
      },
      (error) => {
        console.error('Error fetching showtime:', error);
        setError('Failed to load showtime details');
        setLoading(false);
      }
    );

    // Get seats with real-time updates
    const seatsRef = collection(db, 'showtimes', showtimeId, 'seats');
    const unsubscribeSeats = onSnapshot(seatsRef,
      (snapshot) => {
        const seats: Seat[] = [];
        snapshot.forEach((doc) => {
          const seatData = doc.data();
          seats.push({
            id: doc.id,
            row: seatData.row,
            number: seatData.number,
            status: seatData.status,
            created_at: seatData.created_at,
            updated_at: seatData.updated_at
          });
        });

        // Organize seats by rows
        const rowMap = new Map<string, Seat[]>();
        seats.forEach((seat) => {
          if (!rowMap.has(seat.row)) {
            rowMap.set(seat.row, []);
          }
          rowMap.get(seat.row)?.push(seat);
        });

        // Sort seats within each row by number
        rowMap.forEach((seats) => {
          seats.sort((a, b) => a.number - b.number);
        });

        // Convert map to array and sort by row letter
        const sortedRows: SeatRow[] = Array.from(rowMap.entries())
          .sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
          .map(([row, seats]) => ({ row, seats }));

        setSeatRows(sortedRows);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching seats:', error);
        setError('Failed to load seats');
        setLoading(false);
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeShowtime();
      unsubscribeSeats();
    };
  }, [showtimeId]);

  const handleSeatClick = (seatId: string, status: string) => {
    if (status === 'booked') return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    if (!showtimeDetails) {
      setError('Unable to proceed. Missing showtime details');
      return;
    }

    // Convert Timestamp to ISO string for passing to checkout
    const startTimeISO = showtimeDetails.start_time.toDate().toISOString();

    navigate('/checkout/new', { 
      state: { 
        showtimeId,
        selectedSeats,
        price: showtimeDetails.price,
        movie_title: showtimeDetails.movie_title,
        start_time: startTimeISO,
        screen_number: showtimeDetails.screen_number
      } 
    });
  };

  const formatShowtime = (timestamp: Timestamp) => {
    try {
      return format(timestamp.toDate(), 'PPp');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid Date';
    }
  };

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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {showtimeDetails && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            {showtimeDetails.movie_title}
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Screen {showtimeDetails.screen_number} • {formatShowtime(showtimeDetails.start_time)}
          </Typography>
          {/*<Typography variant="subtitle2" align="center" color="text.secondary">
            Available Seats: {showtimeDetails.available_seats} / {showtimeDetails.total_seats}
          </Typography>*/}
        </Box>
      )}

      <Box sx={{ mb: 6 }}>
        <Typography variant="subtitle1" gutterBottom align="center">
          Screen
        </Typography>
        <Paper
          sx={{
            width: '100%',
            height: 8,
            bgcolor: 'grey.300',
            mb: 4,
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {seatRows.map((row) => (
            <Box key={row.row} sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Typography
                sx={{
                  width: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {row.row}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {row.seats.map((seat) => (
                  <Button
                    key={seat.id}
                    variant={selectedSeats.includes(seat.id) ? "contained" : "outlined"}
                    color={seat.status === 'booked' ? "error" : "primary"}
                    disabled={seat.status === 'booked'}
                    onClick={() => handleSeatClick(seat.id, seat.status)}
                    sx={{
                      minWidth: 'auto',
                      width: 40,
                      height: 40,
                      p: 0,
                    }}
                  >
                    <SeatIcon />
                  </Button>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle1">
            Selected Seats: {selectedSeats.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: ${((selectedSeats.length * (showtimeDetails?.price || 0))).toFixed(2)}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          disabled={selectedSeats.length === 0}
          onClick={handleProceedToCheckout}
        >
          Proceed to Checkout
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Legend
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" size="small" sx={{ minWidth: 'auto' }}>
              <SeatIcon fontSize="small" />
            </Button>
            <Typography>Available</Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="contained" size="small" sx={{ minWidth: 'auto' }}>
              <SeatIcon fontSize="small" />
            </Button>
            <Typography>Selected</Typography>
          </Grid>
          <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" color="error" size="small" sx={{ minWidth: 'auto', color: 'text.disabled',border: '1px solid gray' }}>
              <SeatIcon fontSize="small"  />
            </Button>
            <Typography>Booked</Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SeatSelection;
