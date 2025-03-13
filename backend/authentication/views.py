from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

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

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that uses our serializer"""
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        ip_address = self.get_client_ip(request)
        
        # Check if account is locked
        if FailedLoginAttempt.is_account_locked(username, ip_address):
            return Response(
                {'error': 'Account locked due to too many failed login attempts. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Attempt to authenticate
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            # If we get here, login was successful
            FailedLoginAttempt.clear_failed_attempts(username)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except (InvalidToken, TokenError) as e:
            # Record failed attempt
            FailedLoginAttempt.record_failed_attempt(username, ip_address)
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            # Record failed attempt
            FailedLoginAttempt.record_failed_attempt(username, ip_address)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
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
    throttle_classes = [AuthRateThrottle]
    
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
    throttle_classes = [AuthRateThrottle]
    
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
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer
    throttle_classes = [AuthRateThrottle]
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Send password reset email
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            email_body = f"Hi {user.username},\n\nPlease reset your password by clicking the link below:\n\n{reset_url}\n\nThank you!"
            
            send_mail(
                'Reset your password',
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """View for confirming a password reset"""
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    throttle_classes = [AuthRateThrottle]
    
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
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
