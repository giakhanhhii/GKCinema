import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const MovieList = React.lazy(() => import('./pages/MovieList'));
const MovieDetail = React.lazy(() => import('./pages/MovieDetail'));
const ShowtimeSelection = React.lazy(() => import('./pages/ShowtimeSelection'));
const SeatSelection = React.lazy(() => import('./pages/SeatSelection'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const BookingHistory = React.lazy(() => import('./pages/BookingHistory'));

const LoadingSpinner = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<MovieList />} />
                <Route path="/movies/:movieId" element={<MovieDetail />} />
                <Route path="/movies/:movieId/showtimes" element={<ShowtimeSelection />} />
                <Route path="/showtimes/:showtimeId/seats" element={<SeatSelection />} />
                <Route path="/checkout/new" element={<Checkout />} />
                <Route path="/confirmation/:bookingId" element={<BookingConfirmation />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/bookings" element={<BookingHistory />} />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
