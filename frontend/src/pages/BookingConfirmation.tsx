import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface LocationState {
  paymentId: string;
  amount: number;
  showtimeId?: string;
  selectedSeats?: string[];
  movie_title?: string;
  start_time?: string;
  screen_number?: number;
}

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Redirect if accessed directly without booking details
  if (!state?.paymentId || !state?.amount) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Invalid booking details. Please make a new booking.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  const confirmationNumber = `TKT${Date.now().toString(36).toUpperCase()}`;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <TicketIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your tickets have been booked successfully
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Movie</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{state.movie_title}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Date & Time</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              {state.start_time ? new Date(state.start_time).toLocaleString() : 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Screen</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Screen {state.screen_number}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Seats</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{state.selectedSeats?.join(', ') || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Amount Paid</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>${state.amount.toFixed(2)}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Confirmation Number</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{confirmationNumber}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">Payment ID</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{state.paymentId}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={() => {
            // TODO: Implement email functionality
            console.log('Send email confirmation', {
              confirmationNumber,
              ...state
            });
          }}
        >
          Email Tickets
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => {
            // TODO: Implement download functionality
            console.log('Download tickets', {
              confirmationNumber,
              ...state
            });
          }}
        >
          Download Tickets
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default BookingConfirmation;
