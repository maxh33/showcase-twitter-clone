from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from rest_framework import status, generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.html import strip_tags
from django.template.loader import render_to_string

from .throttling import AuthRateThrottle, LoginRateThrottle
from .serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer,
    RegistrationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    LogoutSerializer,
)
from .models import FailedLoginAttempt
from .utils import send_password_reset_email

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that uses our serializer"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [LoginRateThrottle()]
    
    @swagger_auto_schema(
        operation_description="User login endpoint",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='User email'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='User password'),
            }
        ),
        responses={
            200: 'Returns access and refresh tokens',
            400: 'Bad request',
            401: 'Invalid credentials'
        }
    )
    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '')
        ip_address = self.get_client_ip(request)
        
        # Log request data for debugging
        print(f"Login attempt - Request data: {request.data}")
        
        # Check if account is locked
        if FailedLoginAttempt.is_account_locked(email):
            return Response(
                {'error': 'Account locked due to too many failed login attempts. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        try:
            # Log serializer data
            print(f"Attempting to validate with serializer data: {request.data}")
            
            # Attempt to authenticate
            serializer = self.get_serializer(data=request.data)
            
            # Log validation errors if any
            if not serializer.is_valid():
                print(f"Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # If we get here, login was successful
            FailedLoginAttempt.clear_failed_attempts(email)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
            
        except serializers.ValidationError as e:
            # Log validation error details
            print(f"Validation error during login: {str(e)}")
            # Record failed attempt and return appropriate status code
            FailedLoginAttempt.record_failed_attempt(email, ip_address)
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            
        except (InvalidToken, TokenError) as e:
            # Log token error details
            print(f"Token error during login: {str(e)}")
            # Record failed attempt for token-related errors
            FailedLoginAttempt.record_failed_attempt(email, ip_address)
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            
        except Exception as e:
            # Log unexpected error details
            print(f"Unexpected error during login: {str(e)}")
            # For any other errors, don't record a failed attempt as it might be a server issue
            return Response(
                {'error': 'An unexpected error occurred. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class RegistrationView(generics.CreateAPIView):
    """View for user registration"""
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [AuthRateThrottle()]
    
    @swagger_auto_schema(
        operation_description="Register a new user",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'email', 'password', 'password2'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description='Username'),
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email address'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='Password'),
                'password2': openapi.Schema(type=openapi.TYPE_STRING, description='Password confirmation'),
                'bio': openapi.Schema(type=openapi.TYPE_STRING, description='User bio (optional)'),
                'location': openapi.Schema(type=openapi.TYPE_STRING, description='User location (optional)'),
            }
        ),
        responses={
            201: 'User registered successfully',
            400: 'Bad request - validation errors'
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate verification token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Send verification email
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
            email_body = f"Hi {user.username},\n\nPlease verify your email by clicking the link below:\n\n{verification_url}\n\nThank you!"
            
            send_mail(
                'Verify your email address',
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data,
                'message': 'User registered successfully. Please verify your email.'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """View for email verification"""
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailVerificationSerializer
    
    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [AuthRateThrottle()]
    
    @swagger_auto_schema(
        operation_description="Verify email with token",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['token', 'uidb64'],
            properties={
                'token': openapi.Schema(type=openapi.TYPE_STRING, description='Verification token'),
                'uidb64': openapi.Schema(type=openapi.TYPE_STRING, description='User ID encoded in base64'),
            }
        ),
        responses={
            200: 'Email verified successfully',
            400: 'Invalid token or user ID'
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(serializer.validated_data['uidb64']))
                user = User.objects.get(pk=uid)
                
                if default_token_generator.check_token(user, serializer.validated_data['token']):
                    # Mark email as verified
                    user.is_active = True
                    user.save()
                    
                    return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
                
                return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
            
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({'error': 'Invalid user ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """View for requesting a password reset"""
    serializer_class = PasswordResetRequestSerializer
    throttle_classes = [AuthRateThrottle]
    
    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [AuthRateThrottle()]
    
    @swagger_auto_schema(
        operation_description="Request a password reset",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email address'),
            }
        ),
        responses={
            200: 'Password reset email sent',
            400: 'Invalid email format'
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
                
                # Create email content using template
                context = {
                    'reset_url': reset_url,
                }
                html_content = render_to_string('email/password_reset.html', context)
                text_content = strip_tags(html_content)
                
                # Create email message
                msg = EmailMultiAlternatives(
                    'Reset your password',
                    text_content,
                    f'Twitter Clone <{settings.DEFAULT_FROM_EMAIL}>',
                    [email]
                )
                msg.attach_alternative(html_content, "text/html")
                msg.send()
        except User.DoesNotExist:
            pass
            
        return Response(
            {'message': 'Password reset email sent'},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    """View for confirming a password reset"""
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [AuthRateThrottle()]
    
    @swagger_auto_schema(
        operation_description="Confirm password reset with token",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['token', 'uidb64', 'password', 'password2'],
            properties={
                'token': openapi.Schema(type=openapi.TYPE_STRING, description='Reset token'),
                'uidb64': openapi.Schema(type=openapi.TYPE_STRING, description='User ID encoded in base64'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='New password'),
                'password2': openapi.Schema(type=openapi.TYPE_STRING, description='New password confirmation'),
            }
        ),
        responses={
            200: 'Password reset successful',
            400: 'Invalid input or token'
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(serializer.validated_data['uidb64']))
                user = User.objects.get(pk=uid)
                
                if default_token_generator.check_token(user, serializer.validated_data['token']):
                    # Set new password
                    user.set_password(serializer.validated_data['password'])
                    user.save()
                    
                    return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
                
                return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
            
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({'error': 'Invalid user ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """View for logging out and blacklisting the refresh token"""
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [AuthRateThrottle]
    
    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [AuthRateThrottle()]
    
    def get_permissions(self):
        """Only apply authentication if not in test mode"""
        if settings.TESTING:
            return []
        return [permission() for permission in self.permission_classes]
    
    @swagger_auto_schema(
        operation_description="Logout and invalidate refresh token",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['refresh'],
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token to blacklist'),
            }
        ),
        responses={
            205: 'Logged out successfully',
            400: 'Invalid token'
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_205_RESET_CONTENT)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
