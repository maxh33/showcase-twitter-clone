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
import traceback
import os
import uuid
import logging
from django.urls import reverse
from datetime import datetime, timedelta
from django.utils import timezone

from .throttling import AuthRateThrottle, LoginRateThrottle
from .serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer,
    RegistrationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    LogoutSerializer,
    ResendVerificationSerializer
)
from .models import FailedLoginAttempt
from .utils import send_password_reset_email, send_verification_email, setup_demo_user, send_password_reset_success_email, send_account_activation_success_email

User = get_user_model()
logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that uses our serializer"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [LoginRateThrottle()]
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def check_unverified_account(self, user):
        """Check if user exists but is inactive, and send verification email if needed"""
        if not user.is_active:
            logger.warning(f"Login attempt for inactive account: {user.email}")
            
            # Generate verification token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Determine correct frontend URL based on request origin
            frontend_url = settings.FRONTEND_URL
            request_origin = request.headers.get('Origin', '')

            # If request is from production or preview Vercel deployments, use that URL
            if 'showcase-twitter-clone.vercel.app' in request_origin:
                frontend_url = settings.FRONTEND_URL_PRODUCTION
            elif 'showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app' in request_origin:
                frontend_url = settings.FRONTEND_URL_PREVIEW
            elif request_origin and 'localhost' not in request_origin:
                # If it's not localhost and we have an origin, use it
                frontend_url = request_origin

            verification_url = f"{frontend_url}/verify-email/{uid}/{token}/"
            
            # Send new verification email
            html_content = render_to_string('email/email_verification.html', {
                'verification_url': verification_url,
                'username': user.username
            })
            text_content = strip_tags(html_content)
            
            email = EmailMultiAlternatives(
                'Verify your email address',
                text_content,
                settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            return Response({
                'detail': 'Your account has not been verified yet. We have sent a new verification email to your inbox. Please check your email and click the verification link to activate your account.',
                'message': 'Account not verified. A new verification email has been sent.',
                'requires_verification': True,
                'email': user.email
            }, status=status.HTTP_403_FORBIDDEN)
        
        return None
    
    def find_user_by_credentials(self, email, username):
        """Find user by email or username"""
        try:
            if email and '@' in email:
                user = User.objects.get(email=email)
            elif username:
                user = User.objects.get(username=username)
            elif email:
                # Try to find by username if email doesn't have @ symbol
                user = User.objects.get(username=email)
            else:
                raise User.DoesNotExist()
            
            return user
        except User.DoesNotExist:
            return None
    
    def handle_validation_error(self, serializer, email, user_email=None):
        """Handle validation errors, especially for unverified accounts"""
        errors = serializer.errors
        if isinstance(errors, dict) and errors.get('detail') and errors.get('requires_verification'):
            # Get the email from the error
            user_email = errors.get('email', user_email)
            
            try:
                # Find the user
                user = User.objects.get(email=user_email)
                
                # Generate verification token
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Determine correct frontend URL based on request origin
                frontend_url = settings.FRONTEND_URL
                request_origin = request.headers.get('Origin', '')

                # If request is from production or preview Vercel deployments, use that URL
                if 'showcase-twitter-clone.vercel.app' in request_origin:
                    frontend_url = settings.FRONTEND_URL_PRODUCTION
                elif 'showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app' in request_origin:
                    frontend_url = settings.FRONTEND_URL_PREVIEW
                elif request_origin and 'localhost' not in request_origin:
                    # If it's not localhost and we have an origin, use it
                    frontend_url = request_origin

                verification_url = f"{frontend_url}/verify-email/{uid}/{token}/"
                
                # Send new verification email
                html_content = render_to_string('email/email_verification.html', {
                    'verification_url': verification_url,
                    'username': user.username
                })
                text_content = strip_tags(html_content)
                
                email = EmailMultiAlternatives(
                    'Verify your email address',
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email]
                )
                email.attach_alternative(html_content, "text/html")
                email.send(fail_silently=False)
                
                return Response({
                    'detail': 'Your account has not been verified yet. We have sent a new verification email to your inbox. Please check your email and click the verification link to activate your account.',
                    'message': 'Account not verified. A new verification email has been sent.',
                    'requires_verification': True,
                    'email': user.email
                }, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                logger.error(f"Failed to send verification email: {str(e)}")
                return Response({
                    'detail': 'Your account has not been verified yet. Please check your email for the verification link, or request a new verification email.',
                    'message': 'Account not verified. Please check your email or contact support.',
                    'requires_verification': True
                }, status=status.HTTP_403_FORBIDDEN)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _prepare_request_data(self, request_data):
        """Prepare request data for authentication"""
        # Make a copy of the request data
        data = request_data.copy() if hasattr(request_data, 'copy') else dict(request_data)
        
        # If email is provided but username is not, use email as username
        if 'email' in data and 'username' not in data:
            data['username'] = data['email']
        
        return data
    
    def _get_safe_log_data(self, data):
        """Get safe data for logging (mask password)"""
        safe_data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'password' in safe_data:
            safe_data['password'] = '********'
        return safe_data
    
    def _check_rate_limit(self, email, ip_address):
        """Check if account is rate limited due to failed attempts"""
        if FailedLoginAttempt.is_blocked(email, ip_address):
            return Response(
                {'error': 'Too many failed login attempts. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        return None
    
    def _handle_authentication_success(self, serializer, email):
        """Handle successful authentication"""
        FailedLoginAttempt.clear_failed_attempts(email)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
    def _handle_validation_exception(self, e, email, ip_address):
        """Handle validation exception"""
        logger.error(f"Validation error during login: {str(e)}")
        FailedLoginAttempt.record_failed_attempt(email, ip_address)
        return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    
    def _handle_token_exception(self, e, email, ip_address):
        """Handle token exception"""
        logger.error(f"Token error during login: {str(e)}")
        FailedLoginAttempt.record_failed_attempt(email, ip_address)
        return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    
    def _handle_unexpected_exception(self, e):
        """Handle unexpected exception"""
        logger.exception(f"Unexpected error during login: {str(e)}")
        return Response(
            {'error': 'An unexpected error occurred. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
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
            401: 'Invalid credentials',
            403: 'Email not verified'
        }
    )
    def post(self, request, *args, **kwargs):
        # Get the request's IP address for rate limiting
        ip_address = self.get_client_ip(request)
        
        # Log request data for debugging without exposing passwords
        safe_data = self._get_safe_log_data(request.data)
        logger.info(f"Login attempt - Request data: {safe_data}")
        
        # Get the email/username from the request for tracking failed attempts
        email = request.data.get('email') or request.data.get('username', '')
        username = request.data.get('username', '')
        
        # Check if account is locked due to too many failed attempts
        rate_limit_response = self._check_rate_limit(email, ip_address)
        if rate_limit_response:
            return rate_limit_response
        
        try:
            # First check directly if user exists but is inactive
            user = self.find_user_by_credentials(email, username)
            if user:
                response = self.check_unverified_account(user)
                if response:
                    return response
            
            # Handle both email and username login formats
            request_data = self._prepare_request_data(request.data)
            
            # Log sanitized data
            safe_data = self._get_safe_log_data(request_data)
            logger.debug(f"Attempting to validate with serializer data: {safe_data}")
            
            # Attempt to authenticate
            serializer = self.get_serializer(data=request_data)
            
            # Log validation errors if any
            if not serializer.is_valid():
                logger.warning(f"Serializer validation errors: {serializer.errors}")
                return self.handle_validation_error(serializer, email, user.email if user else None)
            
            # If we get here, login was successful
            return self._handle_authentication_success(serializer, email)
            
        except serializers.ValidationError as e:
            return self._handle_validation_exception(e, email, ip_address)
            
        except (InvalidToken, TokenError) as e:
            return self._handle_token_exception(e, email, ip_address)
            
        except Exception as e:
            return self._handle_unexpected_exception(e)


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
            
            # Determine correct frontend URL based on request origin
            frontend_url = settings.FRONTEND_URL
            request_origin = request.headers.get('Origin', '')

            # If request is from production or preview Vercel deployments, use that URL
            if 'showcase-twitter-clone.vercel.app' in request_origin:
                frontend_url = settings.FRONTEND_URL_PRODUCTION
            elif 'showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app' in request_origin:
                frontend_url = settings.FRONTEND_URL_PREVIEW
            elif request_origin and 'localhost' not in request_origin:
                # If it's not localhost and we have an origin, use it
                frontend_url = request_origin

            verification_url = f"{frontend_url}/verify-email/{uid}/{token}/"
            
            # Render email template
            html_content = render_to_string('email/email_verification.html', {
                'verification_url': verification_url,
                'username': user.username
            })
            text_content = strip_tags(html_content)
            
            # Create email message
            email = EmailMultiAlternatives(
                'Verify your email address',
                text_content,
                settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
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
                    # Check if the user was previously inactive
                    was_inactive = not user.is_active
                    
                    # Mark email as verified
                    user.is_active = True
                    user.save()
                    
                    # Check for duplicate activations within 10 seconds
                    # We use 'last_activation' key to store the timestamp of the last activation
                    now = timezone.now()
                    last_activation = getattr(user, 'last_activation', None)
                    should_send_email = was_inactive
                    
                    if last_activation and (now - last_activation).total_seconds() < 10:
                        # Duplicate activation detected within 10 seconds - don't send another email
                        should_send_email = False
                        logger.info(f"Duplicate activation detected for user: {user.email} - skipping email")
                    
                    if should_send_email:
                        # Set last activation time
                        user.last_activation = now
                        user.save(update_fields=['last_activation'])
                        
                        # Determine correct frontend URL based on request origin
                        frontend_url = settings.FRONTEND_URL
                        request_origin = request.headers.get('Origin', '')

                        # If request is from production or preview Vercel deployments, use that URL
                        if 'showcase-twitter-clone.vercel.app' in request_origin:
                            frontend_url = settings.FRONTEND_URL_PRODUCTION
                        elif 'showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app' in request_origin:
                            frontend_url = settings.FRONTEND_URL_PREVIEW
                        elif request_origin and 'localhost' not in request_origin:
                            # If it's not localhost and we have an origin, use it
                            frontend_url = request_origin
                        
                        # Send success email only if the user was previously inactive
                        login_url = f"{frontend_url}/login"
                        try:
                            send_account_activation_success_email(user.email, login_url)
                            logger.info(f"Sent activation success email to: {user.email}")
                        except Exception as e:
                            logger.error(f"Failed to send account activation success email: {str(e)}")
                            # Continue with the response even if email fails
                    
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
            400: 'Invalid email format',
            403: 'Account not activated',
            500: 'Email sending failed'
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Invalid serializer data: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        email = serializer.validated_data['email']
        logger.debug(f"Processing password reset request for email: {email}")
        
        try:
            user = User.objects.get(email=email)
            logger.debug(f"Found user with email {email}")
            
            if user.is_active:
                logger.debug("User is active, generating reset token")
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Determine correct frontend URL based on request origin
                frontend_url = settings.FRONTEND_URL
                request_origin = request.headers.get('Origin', '')

                # If request is from production or preview Vercel deployments, use that URL
                if 'showcase-twitter-clone.vercel.app' in request_origin:
                    frontend_url = settings.FRONTEND_URL_PRODUCTION
                elif 'showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app' in request_origin:
                    frontend_url = settings.FRONTEND_URL_PREVIEW
                elif request_origin and 'localhost' not in request_origin:
                    # If it's not localhost and we have an origin, use it
                    frontend_url = request_origin
                
                reset_url = f"{frontend_url}/reset-password/confirm/{uid}/{token}"
                logger.debug(f"Generated reset URL: {reset_url}")
                
                try:
                    # Send password reset email
                    logger.debug("Attempting to send password reset email")
                    send_password_reset_email(email, reset_url)
                    logger.info(f"Successfully sent password reset email to {email}")
                    return Response(
                        {'message': 'Password reset instructions have been sent to your email.'},
                        status=status.HTTP_200_OK
                    )
                except Exception as e:
                    logger.error(f"Failed to send password reset email: {str(e)}")
                    logger.error(f"Exception traceback: {traceback.format_exc()}")
                    return Response(
                        {'error': 'Failed to send password reset email. Please try again later.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                logger.debug(f"User {email} is not active")
                # Generate verification token for inactive user
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Determine correct frontend URL based on request origin
                frontend_url = settings.FRONTEND_URL
                request_origin = request.headers.get('Origin', '')

                # If request is from production or preview Vercel deployments, use that URL
                if 'showcase-twitter-clone.vercel.app' in request_origin:
                    frontend_url = settings.FRONTEND_URL_PRODUCTION
                elif 'showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app' in request_origin:
                    frontend_url = settings.FRONTEND_URL_PREVIEW
                elif request_origin and 'localhost' not in request_origin:
                    # If it's not localhost and we have an origin, use it
                    frontend_url = request_origin
                
                verification_url = f"{frontend_url}/verify-email/{uid}/{token}"
                
                try:
                    # Send verification email
                    send_verification_email(email, verification_url)
                    return Response({
                        'error': 'Account not activated',
                        'message': 'Your account is not activated. A new verification email has been sent to your inbox.',
                        'requires_verification': True
                    }, status=status.HTTP_403_FORBIDDEN)
                except Exception as e:
                    logger.error(f"Failed to send verification email: {str(e)}")
                    return Response({
                        'error': 'Account not activated',
                        'message': 'Your account is not activated. Please verify your email before resetting your password.',
                        'requires_verification': True
                    }, status=status.HTTP_403_FORBIDDEN)
                
        except User.DoesNotExist:
            logger.debug(f"No user found with email {email}")
            # For security reasons, we don't want to reveal whether a user exists
            return Response(
                {'message': 'If an account exists with this email, a password reset link has been sent.'},
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
                    
                    # Determine correct frontend URL based on request origin
                    frontend_url = settings.FRONTEND_URL
                    request_origin = request.headers.get('Origin', '')

                    # If request is from production or preview Vercel deployments, use that URL
                    if 'showcase-twitter-clone.vercel.app' in request_origin:
                        frontend_url = settings.FRONTEND_URL_PRODUCTION
                    elif 'showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app' in request_origin:
                        frontend_url = settings.FRONTEND_URL_PREVIEW
                    elif request_origin and 'localhost' not in request_origin:
                        # If it's not localhost and we have an origin, use it
                        frontend_url = request_origin
                    
                    # Send success email
                    login_url = f"{frontend_url}/login"
                    try:
                        send_password_reset_success_email(user.email, login_url)
                    except Exception as e:
                        logger.error(f"Failed to send password reset success email: {str(e)}")
                        # Continue with the response even if email fails
                    
                    return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
                
                return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
            
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({'error': 'Invalid user ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    """View for resending verification email"""
    permission_classes = [permissions.AllowAny]
    serializer_class = ResendVerificationSerializer
    throttle_classes = [AuthRateThrottle]
    
    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [AuthRateThrottle()]
    
    @swagger_auto_schema(
        operation_description="Resend verification email",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email address'),
            }
        ),
        responses={
            200: 'Verification email sent successfully',
            400: 'Invalid email or already verified',
            500: 'Email sending failed'
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                # Generate verification token
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Determine correct frontend URL based on request origin
                frontend_url = settings.FRONTEND_URL
                request_origin = request.headers.get('Origin', '')

                # If request is from production or preview Vercel deployments, use that URL
                if 'showcase-twitter-clone.vercel.app' in request_origin:
                    frontend_url = settings.FRONTEND_URL_PRODUCTION
                elif 'showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app' in request_origin:
                    frontend_url = settings.FRONTEND_URL_PREVIEW
                elif request_origin and 'localhost' not in request_origin:
                    # If it's not localhost and we have an origin, use it
                    frontend_url = request_origin

                verification_url = f"{frontend_url}/verify-email/{uid}/{token}/"
                
                # Send verification email
                html_content = render_to_string('email/email_verification.html', {
                    'verification_url': verification_url,
                    'username': user.username
                })
                text_content = strip_tags(html_content)
                
                email = EmailMultiAlternatives(
                    'Verify your email address',
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email]
                )
                email.attach_alternative(html_content, "text/html")
                email.send(fail_silently=False)
                
                return Response(
                    {'message': 'Verification email has been sent.'},
                    status=status.HTTP_200_OK
                )
                
            except User.DoesNotExist:
                return Response(
                    {'error': 'No user found with this email address.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                logger.error(f"Failed to send verification email: {str(e)}")
                return Response(
                    {'error': 'Failed to send verification email. Please try again later.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
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


class DemoUserLoginView(CustomTokenObtainPairView):
    """View for demo user login"""
    
    def get_throttles(self):
        """Only apply throttling if not in test mode"""
        if settings.TESTING:
            return []
        return [LoginRateThrottle()]
    
    @swagger_auto_schema(
        operation_description="Demo user login endpoint",
        responses={
            200: 'Returns access and refresh tokens for demo user',
            400: 'Bad request',
            429: 'Too many requests',
            500: 'Internal Server Error'
        }
    )
    def post(self, request, *args, **kwargs):
        try:
            # Check rate limit first
            throttle_classes = self.get_throttles()
            for throttle in throttle_classes:
                if not throttle.allow_request(request, self):
                    return Response(
                        {'error': 'Too many demo login attempts. Please try again later.'},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
            
            # Generate a unique session ID from request data with timestamp
            client_ip = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            random_component = str(uuid.uuid4())
            session_id = f"{client_ip}_{timestamp}_{random_component}"
            
            # Cleanup old demo accounts (older than 24 hours)
            cleanup_threshold = timezone.now() - timedelta(hours=24)
            User.objects.filter(
                username__startswith='demo_user_',
                date_joined__lt=cleanup_threshold
            ).delete()
            
            # Create or get a unique demo user for this session
            demo_user, status_msg = setup_demo_user(session_id)
            print(f"Demo user created: {demo_user.username}")
            
            # Create data dict with the unique demo credentials
            demo_data = {
                'email': demo_user.email,
                'username': demo_user.username,
                'password': os.environ.get('DEMO_USER_PASSWORD', 'Demo@123')
            }
            
            # Safe logging (with masked password)
            masked_data = {**demo_data, 'password': '********'}
            print(f"Demo login attempt with credentials: {masked_data}")
            
            # Use the serializer directly
            serializer = self.get_serializer(data=demo_data)
            
            # Log validation errors if any
            if not serializer.is_valid():
                print(f"Demo login - Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # If valid, get response data
            response_data = serializer.validated_data
            
            # Add demo user flag and credentials for client reference
            response_data['is_demo_user'] = True
            response_data['demo_credentials'] = {
                'email': demo_user.email,
                'username': demo_user.username
            }
            response_data['demo_message'] = 'This is a unique demo account created just for your session. Some actions are restricted. Sign up to get full access!'
            
            # Record successful login
            FailedLoginAttempt.clear_failed_attempts(demo_user.email)
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Unexpected error during demo login: {str(e)}")
            print(f"Exception traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Demo login failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
