from rest_framework import serializers

class NotificationPreferencesSerializer(serializers.Serializer):
    email = serializers.BooleanField(default=True)
    push = serializers.BooleanField(default=True)
    sms = serializers.BooleanField(default=False)

class ProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    profile_picture = serializers.URLField(required=False, allow_blank=True)
    preferred_language = serializers.CharField(max_length=10, default='en')
    notification_preferences = NotificationPreferencesSerializer()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        """
        Handle both dictionary and object instances
        """
        if isinstance(instance, dict):
            return super().to_representation(instance)
        
        return super().to_representation({
            'id': instance.id,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'phone_number': instance.phone_number,
            'date_of_birth': instance.date_of_birth,
            'profile_picture': instance.profile_picture,
            'preferred_language': instance.preferred_language,
            'notification_preferences': instance.notification_preferences,
            'created_at': instance.created_at,
            'updated_at': instance.updated_at
        })

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    profile = ProfileSerializer()

    def to_representation(self, instance):
        """
        Handle both dictionary and object instances
        """
        if isinstance(instance, dict):
            return super().to_representation(instance)
        
        return super().to_representation({
            'id': instance.id,
            'email': instance.email,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'profile': instance.profile
        })

class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)

    def validate(self, data):
        """
        Check that the passwords match
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def validate_password(self, value):
        """
        Validate password strength
        """
        if len(value) < 6:
            raise serializers.ValidationError(
                "Password must be at least 6 characters long"
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one number"
            )
        return value

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Check that the new passwords match
        """
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError("New passwords do not match")
        return data

    def validate_new_password(self, value):
        """
        Validate new password strength
        """
        if len(value) < 6:
            raise serializers.ValidationError(
                "Password must be at least 6 characters long"
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one number"
            )
        return value

class FirebaseAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()

class NotificationUpdateSerializer(serializers.Serializer):
    notification_preferences = NotificationPreferencesSerializer()
