import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Dialog,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  ConfirmationNumber as TicketIcon,
  EventSeat as SeatIcon,
  AccessTime as TimeIcon,
  LocalMovies as MovieIcon,
  Theaters as ScreenIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface MovieTicketProps {
  open: boolean;
  onClose: () => void;
  booking: {
    bookingId: string;
    movie_title: string;
    start_time: string;
    screen_number: number;
    selectedSeats: string[];
    amount: number;
    status: string;
  };
}

const MovieTicket: React.FC<MovieTicketProps> = ({ open, onClose, booking }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        },
      }}
    >
      <Box sx={{ position: 'relative', p: 3 }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <TicketIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" gutterBottom align="center">
            Movie Ticket
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 3,
            background: '#fff',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'background.default',
              transform: 'translate(-50%, -50%)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: '50%',
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: 'background.default',
              transform: 'translate(50%, -50%)',
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MovieIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">{booking.movie_title}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  {format(new Date(booking.start_time), 'PPp')}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScreenIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>Screen {booking.screen_number}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SeatIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>Seats: {booking.selectedSeats.join(', ')}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Booking ID: {booking.bookingId}
                </Typography>
                <Typography variant="h6" color="primary.main">
                  ${booking.amount.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center">
            Please show this ticket at the cinema entrance
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default MovieTicket;
