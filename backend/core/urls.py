from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.apps.movies.views import MovieViewSet, ShowTimeViewSet
from backend.apps.bookings.views import BookingViewSet, PaymentViewSet
from backend.apps.users.views import UserViewSet, ProfileViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'movies', MovieViewSet, basename='movie')
router.register(r'showtimes', ShowTimeViewSet, basename='showtime')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
