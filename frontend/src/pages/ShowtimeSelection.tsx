import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  EventSeat as SeatIcon,
  LocalMovies as MovieIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { moviesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  poster_url: string;
}

interface Showtime {
  id: string;
  start_time: string;
  end_time: string;
  price: number;
  available_seats: number;
  screen_number: number;
}

const ShowtimeSelection: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      if (!movieId) return;
      
      try {
        setLoading(true);
        const [movieResponse, showtimesResponse] = await Promise.all([
          moviesApi.getById(movieId),
          moviesApi.getShowtimes(movieId)
        ]);
        setMovie(movieResponse.data);
        setShowtimes(showtimesResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movie and showtimes. Please try again later.');
        console.error('Error fetching movie and showtimes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [movieId]);

  const handleShowtimeSelect = (showtimeId: string) => {
    if (!user) {
      navigate('/login', { state: { from: `/movies/${movieId}/showtimes` } });
      return;
    }
    navigate(`/showtimes/${showtimeId}/seats`);
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
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {movie && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Select Showtime
            </Typography>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 8,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {movie.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MovieIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Duration: {movie.duration} minutes
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {movie.description}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          <Grid container spacing={2}>
            {showtimes.map((showtime) => (
              <Grid item xs={12} sm={6} key={showtime.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                  onClick={() => handleShowtimeSelect(showtime.id)}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Screen {showtime.screen_number}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon sx={{ mr: 1 }} />
                        <Typography>
                          {format(new Date(showtime.start_time), 'PPp')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SeatIcon sx={{ mr: 1 }} />
                        <Typography>
                          {showtime.available_seats} seats available
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h6" color="primary">
                        ${showtime.price}
                      </Typography>
                      <Button
                        variant="contained"
                        disabled={showtime.available_seats === 0}
                      >
                        {showtime.available_seats === 0
                          ? 'Sold Out'
                          : 'Select Seats'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default ShowtimeSelection;
