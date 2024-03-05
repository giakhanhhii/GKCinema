import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { db } from '../config/firebase';
import { 
  doc, 
  writeBatch, 
  serverTimestamp, 
  collection, 
  getDocs,
  addDoc
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  throw new Error('Stripe publishable key is not defined in environment variables');
}

const stripePromise = loadStripe(stripeKey);

interface CheckoutFormProps {
  amount: number;
  onPaymentSuccess: () => Promise<void>;
  bookingDetails: {
    movie_title: string;
    start_time: string;
    screen_number: number;
    selectedSeats: { row: string; number: number; }[];
    showtimeId: string;
  };
}

const CheckoutForm = ({ amount, onPaymentSuccess, bookingDetails }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

      // Update seat statuses in Firebase
      await onPaymentSuccess();

      // Generate a booking ID
      const bookingId = `BK${Date.now().toString(36).toUpperCase()}`;

      // Format selected seats for confirmation
      const formattedSeats = bookingDetails.selectedSeats.map(
        seat => `${seat.row}${seat.number}`
      );

      // Store booking data in Firebase
      const bookingData = {
        bookingId,
        userId: user.uid,
        paymentId: paymentMethod.id,
        amount,
        movie_title: bookingDetails.movie_title,
        start_time: bookingDetails.start_time,
        screen_number: bookingDetails.screen_number,
        selectedSeats: formattedSeats,
        showtimeId: bookingDetails.showtimeId,
        created_at: serverTimestamp(),
        status: 'confirmed'
      };

      // Add booking to 'bookings' collection
      await addDoc(collection(db, 'bookings'), bookingData);

      // Navigate to confirmation with all required details
      navigate(`/confirmation/${bookingId}`, { 
        state: { 
          paymentId: paymentMethod.id,
          amount: amount,
          movie_title: bookingDetails.movie_title,
          start_time: bookingDetails.start_time,
          screen_number: bookingDetails.screen_number,
          selectedSeats: formattedSeats,
          showtimeId: bookingDetails.showtimeId,
          bookingId
        },
        replace: true
      });

    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!stripe || processing}
      >
        {processing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatDetails, setSeatDetails] = useState<any[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location]);

  const bookingDetails = location.state as {
    showtimeId: string;
    selectedSeats: string[];
    price: number;
    movie_title: string;
    start_time: string;
    screen_number: number;
  };

  useEffect(() => {
    const fetchSeatDetails = async () => {
      if (!bookingDetails?.selectedSeats || !bookingDetails?.showtimeId) {
        setError('Invalid booking details');
        setLoading(false);
        return;
      }

      try {
        const seatsRef = collection(db, 'showtimes', bookingDetails.showtimeId, 'seats');
        const seatsSnapshot = await getDocs(seatsRef);
        const seats: { [key: string]: any } = {};
        
        seatsSnapshot.forEach((doc) => {
          const seatData = doc.data();
          seats[doc.id] = {
            id: doc.id,
            row: seatData.row,
            number: seatData.number
          };
        });

        const selectedSeatsDetails = bookingDetails.selectedSeats
          .map(seatId => seats[seatId])
          .filter(seat => seat !== undefined)
          .sort((a, b) => {
            if (a.row !== b.row) return a.row.localeCompare(b.row);
            return a.number - b.number;
          });

        setSeatDetails(selectedSeatsDetails);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching seat details:', err);
        setError('Failed to load seat details');
        setLoading(false);
      }
    };

    fetchSeatDetails();
  }, [bookingDetails]);

  const updateSeatsStatus = async () => {
    const batch = writeBatch(db);
    
    bookingDetails.selectedSeats.forEach((seatId) => {
      const seatRef = doc(db, 'showtimes', bookingDetails.showtimeId, 'seats', seatId);
      batch.update(seatRef, {
        status: 'booked',
        updated_at: serverTimestamp()
      });
    });

    await batch.commit();
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
      <Container maxWidth="sm" sx={{ mt: 4 }}>
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

  const totalAmount = bookingDetails.selectedSeats.length * bookingDetails.price;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Booking Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography color="text.secondary">Movie</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{bookingDetails.movie_title}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Showtime</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              {new Date(bookingDetails.start_time).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Screen</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Screen {bookingDetails.screen_number}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Seats</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              {seatDetails.map(seat => `${seat.row}${seat.number}`).join(', ')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">Total Amount</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>${totalAmount.toFixed(2)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        <Elements stripe={stripePromise}>
          <CheckoutForm 
            amount={totalAmount} 
            onPaymentSuccess={updateSeatsStatus}
            bookingDetails={{
              ...bookingDetails,
              selectedSeats: seatDetails
            }}
          />
        </Elements>
      </Paper>
    </Container>
  );
};

export default Checkout;
