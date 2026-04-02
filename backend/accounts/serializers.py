from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, Review
import bcrypt

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.first_name', read_only=True)
    reviewer_id = serializers.IntegerField(source='reviewer.id', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'reviewer_id', 'reviewer_name', 'rating', 'text', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(source='reviews_received', many=True, read_only=True)

    class Meta:
        model = User
        exclude = ('password', 'groups', 'user_permissions', 'last_login', 'date_joined')

class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use")
        return value
    
    def validate_password(self, value):
        try:
            validate_password(value, user=None)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
            # Check password using Django's built-in check_password
            from django.contrib.auth import authenticate
            authenticated_user = authenticate(username=email, password=password)
            
            if authenticated_user:
                if user.is_blocked:
                    raise serializers.ValidationError("Your account has been blocked")
                data['user'] = user
                return data
            else:
                raise serializers.ValidationError("Invalid email or password")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")

class ProfileUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    bio = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    profile_image = serializers.URLField(required=False, allow_blank=True)
    availability = serializers.ListField(child=serializers.CharField(), required=False)
    is_public = serializers.BooleanField(required=False)

class SkillSerializer(serializers.Serializer):
    skill = serializers.CharField()
