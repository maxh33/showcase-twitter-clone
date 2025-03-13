from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    RegistrationView,
    EmailVerificationView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    LogoutView,
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Email verification
    path('verify-email/', EmailVerificationView.as_view(), name='verify_email'),
    
    # Password reset
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
] 