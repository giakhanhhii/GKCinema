import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocalMovies as MovieIcon,
  EventSeat as SeatIcon,
  Payment as PaymentIcon,
  ConfirmationNumber as TicketIcon,
} from '@mui/icons-material';
import { moviesApi } from '../services/api';

interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  language: string;
  release_date: string;
  poster_url: string;
  genre: string;
  rating: number;
}

const features = [
  {
    icon: <MovieIcon sx={{ fontSize: 40 }} />,
    title: 'Latest Movies',
    description: 'Browse through our collection of latest movies from different genres.',
  },
  {
    icon: <SeatIcon sx={{ fontSize: 40 }} />,
    title: 'Easy Booking',
    description: 'Select your preferred seats with our interactive seat map.',
  },
  {
    icon: <PaymentIcon sx={{ fontSize: 40 }} />,
    title: 'Secure Payments',
    description: 'Pay securely using your preferred payment method.',
  },
  {
    icon: <TicketIcon sx={{ fontSize: 40 }} />,
    title: 'Instant Confirmation',
    description: 'Get instant confirmation and e-tickets on your email.',
  },
];

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await moviesApi.getAll();
        setMovies(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch movies. Please try again later.');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: isMobile ? '2.5rem' : '2.5rem',
                }}
              >
                Book Movie Tickets Online
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Experience the magic of cinema with our easy booking system
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/movies')}
                sx={{
                  bgcolor: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                }}
              >
                Browse Movies
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Now Showing Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Now Showing
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {movies.map((movie) => (
              <Grid item xs={12} sm={6} md={4} key={movie.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                  }}
                  onClick={() => navigate(`/movies/${movie.id}`)}
                >
                  <Box
                    sx={{
                      pt: '150%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={movie.poster_url}
                      alt={movie.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {movie.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {movie.genre} • {movie.duration} min
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rating: {movie.rating}/10
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
                elevation={2}
              >
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 2,
                    borderRadius: '50%',
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h3"
                    sx={{ mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section
      <Box
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          py: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <Typography variant="h4" component="h2" gutterBottom>
                Ready to Book Your Movie Experience?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Get started now and enjoy the latest movies in theaters
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/movies')}
                sx={{
                  bgcolor: 'white',
                  color: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Book Now
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box> */}
    </Box>
  );
};

export default Home;
