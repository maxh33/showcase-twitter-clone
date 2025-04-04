from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import logging
import traceback

# Set up logger
logger = logging.getLogger(__name__)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'bio', 'location', 'profile_picture',
                  'followers_count', 'following_count', 'created_at')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that includes user data in the response"""
    
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Also allow username login for backward compatibility
        self.fields['username'] = serializers.CharField(required=False)
        logger.debug("CustomTokenObtainPairSerializer initialized with username field")
    
    def validate(self, attrs):
        """Validate credentials and return token data"""
        
        # Create a copy of attrs for logging and to avoid modifying the input dict
        attrs_copy = dict(attrs)
        
        # Combine username and email to make login fields more flexible
        if 'username' in attrs and 'email' not in attrs:
            logger.debug("CustomTokenObtainPairSerializer initialized with username field")
            attrs_copy['email'] = attrs['username']
        
        # Check if this is an actual email or just a username
        if 'email' in attrs_copy and not '@' in attrs_copy['email']:
            logger.debug(f"Login attempt with username, not email: {attrs_copy.get('email')}")
            try:
                # Try to find the user by username and get their email
                user = User.objects.get(username=attrs_copy['email'])
                logger.debug(f"Found user by username, email is: {user.email}")
                # Replace username with actual email for authentication
                attrs_copy['email'] = user.email
            except User.DoesNotExist:
                logger.debug(f"No user found with username: {attrs_copy.get('email')}")
                # Keep as is, will fail validation later
                pass
        
        # If neither username nor email was provided, raise an error
        if not 'email' in attrs_copy:
            raise serializers.ValidationError(
                'No valid login credentials provided',
                code='authorization'
            )
        
        # First, check if the user exists but is inactive
        try:
            # Try to find by email first
            if '@' in attrs_copy['email']:
                user = User.objects.get(email=attrs_copy['email'])
            else:
                # Then try by username
                user = User.objects.get(username=attrs_copy['email'])
            
            # If user exists but is inactive, return appropriate error
            if not user.is_active:
                logger.warning(f"Login attempt for inactive account: {user.email}")
                raise serializers.ValidationError({
                    'detail': 'Your account has not been verified yet. Please check your email for the verification link.',
                    'requires_verification': True,
                    'email': user.email
                })
        except User.DoesNotExist:
            # User doesn't exist, continue with normal flow to return generic error
            pass
        
        try:
            if '@' in attrs_copy['email']:
                logger.debug(f"Attempting to validate with email: {attrs_copy.get('email')}")
                # Use the parent class validate method with email and password
                auth_attrs = {'email': attrs_copy['email'], 'password': attrs_copy['password']}
            else:
                logger.debug(f"Attempting to validate with username: {attrs_copy.get('email')}")
                # Use the parent class validate method with username and password
                auth_attrs = {'username': attrs_copy['email'], 'password': attrs_copy['password']}
            
            logger.debug(f"Created auth_attrs for super().validate: {auth_attrs}")
            
            try:
                data = super().validate(auth_attrs)
                logger.debug("super().validate succeeded")
            except Exception as e:
                logger.error(f"super().validate failed with exception: {str(e)}")
                logger.error(f"Exception traceback: {traceback.format_exc()}")
                raise
            
            # Add user details to response
            user = self.user
            logger.debug(f"Authentication successful for user: {user.email}")
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
            logger.error(f"Validation error: {e}")
            # Re-raise validation errors with 401 status for invalid credentials
            if 'no active account found with the given credentials' in str(e).lower():
                raise serializers.ValidationError('Invalid username/email or password', code='authentication_failed')
            raise
        except Exception as e:
            logger.error(f"Unexpected error during authentication: {str(e)}")
            logger.error(f"Exception traceback: {traceback.format_exc()}")
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
        
        # Create user with is_active=False
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            bio=validated_data.get('bio', ''),
            location=validated_data.get('location', ''),
            is_active=False
        )
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset"""
    email = serializers.EmailField(required=True)


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


class ResendVerificationSerializer(serializers.Serializer):
    """Serializer for resending verification email"""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if user.is_active:
                raise serializers.ValidationError("This email is already verified.")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")


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