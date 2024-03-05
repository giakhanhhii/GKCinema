import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Language as LanguageIcon,
  DateRange as DateIcon,
  LocalMovies as MovieIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { moviesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  language: string;
  release_date: string;
  poster_url: string;
  genre: string;
  rating: number;
}

interface ShowTime {
  id: number;
  start_time: string;
  end_time: string;
  price: number;
  available_seats: number;
  screen_number: number;
}

const MovieDetail: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<ShowTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // console.log(showtimes[0].start_time);
  // {showtimes.map((showtime) => (console.log(showtime.start_time)))};
  const fetchMovieDetails = useCallback(async () => {
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
      setError('Failed to fetch movie details. Please try again later.');
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);

  const handleShowtimeSelect = (showtimeId: number) => {
    if (!user) {
      navigate('/login', { state: { from: `/movies/${movieId}` } });
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
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {movie && (
        <>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 8,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h1" gutterBottom>
                {movie.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={movie.rating / 2} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({movie.rating}/10)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip
                  icon={<MovieIcon />}
                  label={movie.genre}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<TimeIcon />}
                  label={`${movie.duration} min`}
                  variant="outlined"
                />
                <Chip
                  icon={<LanguageIcon />}
                  label={movie.language}
                  variant="outlined"
                />
                <Chip
                  icon={<DateIcon />}
                  label={format(new Date(movie.release_date), 'PP')}
                  variant="outlined"
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                Synopsis
              </Typography>
              <Typography variant="body1" paragraph>
                {movie.description}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Available Showtimes
            </Typography>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Screen</TableCell>
                    {/* <TableCell>Available Seats</TableCell> */}
                    <TableCell>Price</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {showtimes.map((showtime) => (
                    <TableRow key={showtime.id}>
                      <TableCell>
                        {format(new Date(showtime.start_time), 'PPp')}
                      </TableCell>
                      <TableCell>Screen {showtime.screen_number}</TableCell>
                      {/* <TableCell>{showtime.available_seats}</TableCell> */}
                      <TableCell>${showtime.price}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleShowtimeSelect(showtime.id)}
                          disabled={showtime.available_seats === 0}
                        >
                          {showtime.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Container>
  );
};

export default MovieDetail;
