from django.urls import path
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'auth'

from .views import (
    CustomTokenObtainPairView,
    RegistrationView,
    EmailVerificationView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    LogoutView,
)

def auth_api_root(request):
    """Root endpoint for auth API"""
    return JsonResponse({
        "status": "success",
        "message": "Auth API is running",
        "endpoints": {
            "register": "register/",
            "login": "login/",
            "logout": "logout/",
            "token_refresh": "token/refresh/",
            "verify_email": "verify-email/",
            "password_reset": "password-reset/",
            "password_reset_confirm": "password-reset/confirm/"
        }
    })

urlpatterns = [
    # API root
    path('', auth_api_root, name='auth-api-root'),
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