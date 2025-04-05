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
        # Create a safe copy for logging (without password)
        safe_attrs = attrs.copy()
        if 'password' in safe_attrs:
            safe_attrs['password'] = '********'
        logger.debug(f"Login attempt with attrs: {safe_attrs}")
        
        # Make a copy of the attributes to avoid modifying the original
        attrs_copy = attrs.copy()
        
        # Handle different login scenarios:
        # 1. Username only (find user and set email)
        # 2. Email only (set username to email)
        # 3. Both provided (use as-is)
        
        username = attrs_copy.get('username')
        email = attrs_copy.get('email')
        
        # Case 1: Username provided but no email
        if username and not email:
            logger.debug(f"Login attempt with username only: {username}")
            try:
                user = User.objects.get(username=username)
                attrs_copy['email'] = user.email
                logger.debug(f"Found user email: {user.email}")
            except User.DoesNotExist:
                logger.warning(f"No user found with username: {username}")
                raise serializers.ValidationError(
                    {'username': 'No user found with this username.'},
                    code='authorization'
                )
        
        # Case 2: Email provided but no username
        elif email and not username:
            logger.debug(f"Login attempt with email only: {email}")
            # SimpleJWT's parent class expects username field to be populated
            attrs_copy['username'] = email
            
            # Verify user exists with this email
            try:
                user = User.objects.get(email=email)
                logger.debug(f"Found user by email: {email}")
            except User.DoesNotExist:
                logger.warning(f"No user found with email: {email}")
                raise serializers.ValidationError(
                    {'email': 'No account found with this email address.'},
                    code='authorization'
                )
        
        # Case 3: Neither provided
        elif not username and not email:
            logger.warning("Neither username nor email was provided")
            raise serializers.ValidationError(
                'No valid login credentials provided',
                code='authorization'
            )
        
        # Check if password exists
        if not attrs_copy.get('password'):
            logger.warning("Password was not provided")
            raise serializers.ValidationError(
                {'password': 'Password is required.'},
                code='authorization'
            )
        
        try:
            logger.debug(f"Attempting to validate with credentials")
            
            # Check if user is active before authentication
            if email:
                user = User.objects.filter(email=email).first()
            else:
                user = User.objects.filter(username=username).first()
                
            if user and not user.is_active:
                raise serializers.ValidationError(
                    {'email': 'This account is not active. Please verify your email.'},
                    code='authorization'
                )
            
            # Call parent validate method for actual authentication
            try:
                data = super().validate(attrs_copy)
                logger.debug("Authentication successful")
            except Exception as e:
                logger.error(f"Authentication failed: {str(e)}")
                logger.error(f"Exception traceback: {traceback.format_exc()}")
                raise serializers.ValidationError(
                    {'password': 'No active account found with the given credentials.'},
                    code='authorization'
                )
            
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
            raise
        except Exception as e:
            logger.error(f"Unexpected error during authentication: {str(e)}")
            logger.error(f"Exception traceback: {traceback.format_exc()}")
            # Log unexpected errors but don't expose them to the client
            raise serializers.ValidationError(
                {'error': 'An error occurred during authentication. Please try again.'},
                code='authentication_failed'
            )


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