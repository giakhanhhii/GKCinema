from rest_framework import serializers

class SeatSerializer(serializers.Serializer):
    id = serializers.CharField()
    row = serializers.CharField()
    number = serializers.IntegerField()
    status = serializers.CharField()

class ShowTimeSerializer(serializers.Serializer):
    id = serializers.CharField()
    movie_id = serializers.CharField()
    movie_title = serializers.CharField(read_only=True)
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    price = serializers.DecimalField(max_digits=6, decimal_places=2)
    total_seats = serializers.IntegerField()
    available_seats = serializers.IntegerField()
    screen_number = serializers.IntegerField()
    seats = SeatSerializer(many=True, read_only=True)

class MovieSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    duration = serializers.IntegerField()
    language = serializers.CharField()
    release_date = serializers.DateField()
    poster_url = serializers.URLField()
    genre = serializers.CharField()
    rating = serializers.DecimalField(max_digits=3, decimal_places=1)
    showtimes = ShowTimeSerializer(many=True, read_only=True)

    def to_representation(self, instance):
        # Handle both dictionary and object instances
        if isinstance(instance, dict):
            return super().to_representation(instance)
        return super().to_representation({
            'id': instance.id,
            'title': instance.title,
            'description': instance.description,
            'duration': instance.duration,
            'language': instance.language,
            'release_date': instance.release_date,
            'poster_url': instance.poster_url,
            'genre': instance.genre,
            'rating': instance.rating,
            'showtimes': instance.showtimes
        })
