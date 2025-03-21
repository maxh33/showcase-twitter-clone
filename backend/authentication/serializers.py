from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'bio', 'location', 'profile_picture',
                  'followers_count', 'following_count', 'created_at')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that includes user data in the response"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Keep both fields, allowing login with either username or email
        self.fields['email'] = serializers.EmailField(required=False)
    
    def validate(self, attrs):
        # Check if email is provided, use it for authentication
        if 'email' in attrs and attrs['email']:
            # Find user by email
            try:
                user = User.objects.get(email=attrs['email'])
                attrs['username'] = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {'email': 'No user found with this email address.'},
                    code='authorization'
                )
            
            # Remove email from attrs now that we've set username
            attrs.pop('email', None)
        
        # Only proceed if username exists
        if not attrs.get('username'):
            raise serializers.ValidationError(
                {'username': 'Username or email is required.'},
                code='authorization'
            )
        
        try:
            data = super().validate(attrs)
            
            # Add user details to response
            user = self.user
            data.update({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'bio': user.bio,
                    'location': user.location,
                    'profile_picture': user.profile_picture.url if user.profile_picture else None,
                    'followers_count': user.followers_count,
                    'following_count': user.following_count,
                }
            })
            
            return data
        except serializers.ValidationError as e:
            # Re-raise validation errors with 401 status for invalid credentials
            if 'no active account found with the given credentials' in str(e).lower():
                raise serializers.ValidationError('Invalid username/email or password', code='authentication_failed')
            raise
        except Exception as e:
            # Log unexpected errors but don't expose them to the client
            raise serializers.ValidationError('An error occurred during authentication')


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'bio', 'location')
    
    def validate_username(self, value):
        """Validate username format and availability"""
        # Check length
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if len(value) > 30:
            raise serializers.ValidationError("Username cannot exceed 30 characters.")
        
        # Check if username contains only allowed characters
        import re
        if not re.match(r'^[a-zA-Z0-9_. -]+$', value):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, spaces, periods, underscores, and hyphens."
            )
        
        # Check for offensive terms
        offensive_terms = ['admin', 'root', 'administrator', 'moderator', 'superuser']
        if value.lower() in offensive_terms or any(term in value.lower() for term in offensive_terms):
            raise serializers.ValidationError("This username is not allowed.")
        
        # Check if already in use
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        
        return value
        
    def validate(self, attrs):
        # Check that passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check email uniqueness
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email is already in use."})
        
        return attrs
    
    def create(self, validated_data):
        # Remove password2 field
        validated_data.pop('password2', None)
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            bio=validated_data.get('bio', ''),
            location=validated_data.get('location', '')
        )
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset"""
    token = serializers.CharField(required=True)
    uidb64 = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    token = serializers.CharField(required=True)
    uidb64 = serializers.CharField(required=True)


class LogoutSerializer(serializers.Serializer):
    """Serializer for logging out and blacklisting the refresh token"""
    refresh = serializers.CharField(required=True)
    
    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs
    
    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except Exception as e:
            raise serializers.ValidationError(str(e)) 