from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import update_session_auth_hash
from .serializers import UserSerializer, ProfileSerializer, UserRegistrationSerializer, PasswordChangeSerializer
from backend.utils.firebase_utils import FirestoreService
import firebase_admin
from firebase_admin import auth

class UserViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ['register', 'verify_firebase_token']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        """Get current user's profile"""
        try:
            user_profile = FirestoreService.get_user_profile(request.user.id)
            if not user_profile:
                return Response(
                    {'error': 'Profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = UserSerializer({
                'id': request.user.id,
                'email': request.user.email,
                'profile': user_profile
            })
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user"""
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Create user in Firebase Auth
            user = auth.create_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                display_name=f"{serializer.validated_data['first_name']} {serializer.validated_data['last_name']}"
            )

            # Create user profile in Firestore
            profile_data = {
                'first_name': serializer.validated_data['first_name'],
                'last_name': serializer.validated_data['last_name'],
                'phone_number': serializer.validated_data.get('phone_number', ''),
                'preferred_language': 'en',
                'notification_preferences': {
                    'email': True,
                    'push': True,
                    'sms': False
                }
            }
            FirestoreService.update_user_profile(user.uid, profile_data)

            return Response(
                {'message': 'User registered successfully'},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def verify_firebase_token(self, request):
        """Verify Firebase ID token"""
        try:
            id_token = request.data.get('id_token')
            if not id_token:
                return Response(
                    {'error': 'No token provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']

            # Get or create user profile
            user_profile = FirestoreService.get_user_profile(firebase_uid)
            if not user_profile:
                # Create new profile if it doesn't exist
                profile_data = {
                    'email': decoded_token.get('email', ''),
                    'first_name': decoded_token.get('name', '').split()[0],
                    'last_name': decoded_token.get('name', '').split()[-1],
                    'preferred_language': 'en',
                    'notification_preferences': {
                        'email': True,
                        'push': True,
                        'sms': False
                    }
                }
                user_profile = FirestoreService.update_user_profile(firebase_uid, profile_data)

            return Response({
                'user': {
                    'id': firebase_uid,
                    'email': decoded_token.get('email', ''),
                    'profile': user_profile
                }
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        try:
            serializer = PasswordChangeSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Update password in Firebase Auth
            auth.update_user(
                request.user.id,
                password=serializer.validated_data['new_password']
            )

            return Response({'message': 'Password updated successfully'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get current user's profile"""
        try:
            profile = FirestoreService.get_user_profile(request.user.id)
            if not profile:
                return Response(
                    {'error': 'Profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request):
        """Update user profile"""
        try:
            serializer = ProfileSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            profile = FirestoreService.update_user_profile(
                request.user.id,
                serializer.validated_data
            )

            return Response(ProfileSerializer(profile).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['patch'])
    def update_notification_preferences(self, request):
        """Update notification preferences"""
        try:
            preferences = request.data.get('notification_preferences', {})
            
            profile = FirestoreService.get_user_profile(request.user.id)
            if not profile:
                return Response(
                    {'error': 'Profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Update only notification preferences
            current_preferences = profile.get('notification_preferences', {})
            current_preferences.update(preferences)
            
            updated_profile = FirestoreService.update_user_profile(
                request.user.id,
                {'notification_preferences': current_preferences}
            )

            return Response(ProfileSerializer(updated_profile).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
