from rest_framework import serializers
from backend.apps.movies.serializers import ShowTimeSerializer, SeatSerializer

class PaymentSerializer(serializers.Serializer):
    id = serializers.CharField()
    booking_id = serializers.CharField()
    stripe_payment_intent_id = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    payment_status = serializers.CharField()
    payment_method = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()

class BookingSerializer(serializers.Serializer):
    id = serializers.CharField()
    user_id = serializers.CharField()
    showtime_id = serializers.CharField()
    seat_ids = serializers.ListField(child=serializers.CharField())
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    payment_status = serializers.CharField()
    payment_intent_id = serializers.CharField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    # Nested serializers for detailed information
    showtime_details = ShowTimeSerializer(read_only=True)
    seats_details = SeatSerializer(many=True, read_only=True)
    payment_details = PaymentSerializer(read_only=True)

    def validate(self, data):
        """
        Validate the booking data.
        """
        if not data.get('seat_ids'):
            raise serializers.ValidationError("At least one seat must be selected")
        
        # Additional validation can be added here
        # For example, checking if seats are available, if showtime exists, etc.
        
        return data

    def to_representation(self, instance):
        """
        Handle both dictionary and object instances
        """
        if isinstance(instance, dict):
            return super().to_representation(instance)
        
        return super().to_representation({
            'id': instance.id,
            'user_id': instance.user_id,
            'showtime_id': instance.showtime_id,
            'seat_ids': instance.seat_ids,
            'total_amount': instance.total_amount,
            'status': instance.status,
            'payment_status': instance.payment_status,
            'payment_intent_id': instance.payment_intent_id,
            'created_at': instance.created_at,
            'updated_at': instance.updated_at,
            'showtime_details': instance.showtime_details,
            'seats_details': instance.seats_details,
            'payment_details': instance.payment_details
        })

class PaymentIntentSerializer(serializers.Serializer):
    booking_id = serializers.CharField()
    payment_method_id = serializers.CharField(required=False)
    return_url = serializers.URLField(required=False)

class BookingSummarySerializer(serializers.Serializer):
    id = serializers.CharField()
    movie_title = serializers.CharField(source='showtime_details.movie_title')
    showtime = serializers.DateTimeField(source='showtime_details.start_time')
    seats = serializers.ListField(child=serializers.CharField())
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    booking_date = serializers.DateTimeField(source='created_at')

    def to_representation(self, instance):
        """
        Create a simplified representation of a booking
        """
        data = super().to_representation(instance)
        # Format seats as a comma-separated string of seat numbers
        if isinstance(instance, dict):
            seats = instance.get('seats_details', [])
            data['seats'] = [f"{seat['row']}{seat['number']}" for seat in seats]
        return data
