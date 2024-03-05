import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { moviesApi } from '../services/api';

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

const MovieList: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

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

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGenre =
      !selectedGenre || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesLanguage =
      !selectedLanguage ||
      movie.language.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesGenre && matchesLanguage;
  });

  const uniqueGenres = Array.from(new Set(movies.map((movie) => movie.genre)));
  const uniqueLanguages = Array.from(
    new Set(movies.map((movie) => movie.language))
  );

  const renderMovieCard = (movie: Movie) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
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
        onClick={() => navigate(`/movies/${movie.id}`)}
      >
        <CardMedia
          component="img"
          height="400"
          image={movie.poster_url}
          alt={movie.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {movie.title}
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Rating value={movie.rating / 2} precision={0.5} readOnly size="small" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label={movie.genre}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={movie.language}
              size="small"
              color="secondary"
              variant="outlined"
            />
            <Chip
              label={`${movie.duration} min`}
              size="small"
              variant="outlined"
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {movie.description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={400} />
            <CardContent>
              <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Skeleton variant="rectangular" width={60} height={24} />
                <Skeleton variant="rectangular" width={60} height={24} />
                <Skeleton variant="rectangular" width={60} height={24} />
              </Box>
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Movies
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search Movies"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Genre</InputLabel>
            <Select
              value={selectedGenre}
              label="Genre"
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <MenuItem value="">All Genres</MenuItem>
              {uniqueGenres.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={selectedLanguage}
              label="Language"
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <MenuItem value="">All Languages</MenuItem>
              {uniqueLanguages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {loading ? renderSkeleton() : filteredMovies.map(renderMovieCard)}
        {!loading && filteredMovies.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              No movies found matching your criteria.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default MovieList;
