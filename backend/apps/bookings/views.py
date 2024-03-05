from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import stripe
from django.conf import settings
from .serializers import BookingSerializer, PaymentSerializer
from backend.utils.firebase_utils import FirestoreService

stripe.api_key = settings.STRIPE_SECRET_KEY

class BookingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get all bookings for the current user"""
        try:
            bookings = FirestoreService.get_user_bookings(request.user.id)
            serializer = BookingSerializer(bookings, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        """Get a specific booking"""
        try:
            booking = FirestoreService.get_booking(pk)
            if not booking:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if the booking belongs to the current user
            if booking.get('user_id') != request.user.id:
                return Response(
                    {'error': 'Not authorized to view this booking'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request):
        """Create a new booking"""
        try:
            # Validate the request data
            serializer = BookingSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Add user information to booking data
            booking_data = {
                **serializer.validated_data,
                'user_id': request.user.id,
                'status': 'pending',
                'payment_status': 'pending'
            }

            # Create booking in Firestore
            booking = FirestoreService.create_booking(booking_data)

            # Update seat status to 'selected'
            FirestoreService.update_seats_status(
                booking_data['showtime_id'],
                booking_data['seat_ids'],
                'selected'
            )

            return Response(
                BookingSerializer(booking).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def create_payment_intent(self, request, pk=None):
        """Create Stripe PaymentIntent for a booking"""
        try:
            booking = FirestoreService.get_booking(pk)
            if not booking:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Create PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=int(booking['total_amount'] * 100),  # Convert to cents
                currency='usd',
                metadata={
                    'booking_id': pk,
                    'user_id': request.user.id
                }
            )

            # Update booking with payment intent ID
            FirestoreService.update_booking_status(pk, {
                'payment_intent_id': intent.id
            })

            return Response({
                'clientSecret': intent.client_secret,
                'amount': booking['total_amount']
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirm payment for a booking"""
        try:
            booking = FirestoreService.get_booking(pk)
            if not booking:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            payment_intent_id = booking.get('payment_intent_id')
            if not payment_intent_id:
                return Response(
                    {'error': 'No payment intent found for this booking'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify payment status with Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if intent.status == 'succeeded':
                # Update booking status
                FirestoreService.update_booking_status(pk, {
                    'status': 'confirmed',
                    'payment_status': 'completed'
                })

                # Update seat status to 'booked'
                FirestoreService.update_seats_status(
                    booking['showtime_id'],
                    booking['seat_ids'],
                    'booked'
                )

                # Create payment record
                payment_data = {
                    'booking_id': pk,
                    'stripe_payment_intent_id': payment_intent_id,
                    'amount': booking['total_amount'],
                    'currency': 'usd',
                    'payment_status': 'completed',
                    'payment_method': intent.payment_method
                }
                FirestoreService.create_payment(payment_data)

                return Response({'status': 'payment confirmed'})
            else:
                return Response(
                    {'error': 'Payment not succeeded'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        try:
            booking = FirestoreService.get_booking(pk)
            if not booking:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if booking['status'] == 'confirmed':
                return Response(
                    {'error': 'Cannot cancel confirmed booking'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update booking status
            FirestoreService.update_booking_status(pk, {
                'status': 'cancelled'
            })

            # Release seats
            FirestoreService.update_seats_status(
                booking['showtime_id'],
                booking['seat_ids'],
                'available'
            )

            return Response({'status': 'booking cancelled'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PaymentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get all payments for the current user's bookings"""
        try:
            # Get user's bookings
            bookings = FirestoreService.get_user_bookings(request.user.id)
            booking_ids = [booking['id'] for booking in bookings]

            # Get payments for these bookings
            payments = []
            for booking_id in booking_ids:
                payment = FirestoreService.get_payment(booking_id)
                if payment:
                    payments.append(payment)

            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        """Get a specific payment"""
        try:
            payment = FirestoreService.get_payment(pk)
            if not payment:
                return Response(
                    {'error': 'Payment not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if the payment belongs to the current user's booking
            booking = FirestoreService.get_booking(payment['booking_id'])
            if booking['user_id'] != request.user.id:
                return Response(
                    {'error': 'Not authorized to view this payment'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
