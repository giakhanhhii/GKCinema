import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = 'http://localhost:8001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Movies API
export const moviesApi = {
  getAll: () => api.get('/movies/'),
  getById: (id: string) => api.get(`/movies/${id}/`),
  getShowtimes: (movieId: string) => api.get(`/movies/${movieId}/showtimes/`),
};

// Showtimes API
export const showtimesApi = {
  getAll: () => api.get('/showtimes/'),
  getById: (id: string) => api.get(`/showtimes/${id}/`),
  getSeats: (showtimeId: string) => api.get(`/showtimes/${showtimeId}/seats/`),
};

// Bookings API
export const bookingsApi = {
  getAll: () => api.get('/bookings/'),
  getById: (id: string) => api.get(`/bookings/${id}/`),
  create: (data: any) => api.post('/bookings/', data),
  createPaymentIntent: (bookingId: string) => 
    api.post(`/bookings/${bookingId}/create_payment_intent/`),
  confirmPayment: (bookingId: string) => 
    api.post(`/bookings/${bookingId}/confirm_payment/`),
  cancel: (bookingId: string) => 
    api.post(`/bookings/${bookingId}/cancel/`),
};

// Auth API
export const authApi = {
  register: (data: any) => api.post('/users/register/', data),
  login: (data: any) => api.post('/users/login/', data),
  logout: () => api.post('/users/logout/'),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data: any) => api.patch('/users/profile/', data),
  changePassword: (data: any) => api.post('/users/change_password/', data),
  verifyFirebaseToken: (idToken: string) => 
    api.post('/users/verify_firebase_token/', { id_token: idToken }),
  updateNotificationPreferences: (data: any) => 
    api.patch('/users/update_notification_preferences/', data),
};

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get Firebase ID token if user is logged in
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - show error message
          console.error('Access denied');
          break;
        case 404:
          // Not found - show error message
          console.error('Resource not found');
          break;
        default:
          // Other errors - show generic error message
          console.error('An error occurred:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
