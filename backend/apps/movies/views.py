from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from backend.apps.movies.serializers import MovieSerializer, ShowTimeSerializer
from backend.utils.firebase_utils import FirestoreService

class MovieViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        """Get all movies"""
        try:
            movies = FirestoreService.get_movies()
            serializer = MovieSerializer(movies, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        """Get a specific movie"""
        try:
            movie = FirestoreService.get_movie(pk)
            if not movie:
                return Response(
                    {'error': 'Movie not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = MovieSerializer(movie)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def showtimes(self, request, pk=None):
        """Get showtimes for a specific movie"""
        try:
            showtimes = FirestoreService.get_showtimes(pk)
            serializer = ShowTimeSerializer(showtimes, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ShowTimeViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        """Get all showtimes"""
        try:
            movie_id = request.query_params.get('movie_id')
            showtimes = FirestoreService.get_showtimes(movie_id)
            serializer = ShowTimeSerializer(showtimes, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        """Get a specific showtime"""
        try:
            showtime = FirestoreService.get_showtime(pk)
            if not showtime:
                return Response(
                    {'error': 'Showtime not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = ShowTimeSerializer(showtime)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def seats(self, request, pk=None):
        """Get seats for a specific showtime"""
        try:
            showtime = FirestoreService.get_showtime(pk)
            if not showtime:
                return Response(
                    {'error': 'Showtime not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            return Response(showtime.get('seats', []))
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
