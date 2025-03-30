import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.template.loader import render_to_string
from django.conf import settings
from django.test import override_settings

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user():
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='StrongPassword123!',
        is_active=True
    )
    return user

@pytest.fixture
def inactive_user():
    user = User.objects.create_user(
        username='inactiveuser',
        email='inactive@example.com',
        password='StrongPassword123!',
        is_active=False
    )
    return user

@pytest.fixture(autouse=True)
def disable_throttling(settings):
    print("TESTING flag:", settings.TESTING)  # Debug print
    settings.REST_FRAMEWORK = {
        'DEFAULT_THROTTLE_CLASSES': [],
        'DEFAULT_THROTTLE_RATES': {}
    }

@pytest.mark.django_db
class TestRegistration:
    def test_successful_registration(self, api_client):
        """Test that a user can register successfully with valid credentials"""
        url = reverse('auth:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'StrongPassword123!',
            'password2': 'StrongPassword123!',
            'bio': 'Test bio',
            'location': 'Test location'
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username='newuser').exists()
        
        # Check that the user is not active (needs email verification)
        user = User.objects.get(username='newuser')
        assert not user.is_active
    
    def test_registration_with_invalid_password(self, api_client):
        """Test that registration fails with weak password"""
        url = reverse('auth:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'password',  # Too weak
            'password2': 'password',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not User.objects.filter(username='newuser').exists()
    
    def test_registration_with_mismatched_passwords(self, api_client):
        """Test that registration fails when passwords don't match"""
        url = reverse('auth:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'StrongPassword123!',
            'password2': 'DifferentPassword123!',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not User.objects.filter(username='newuser').exists()


@pytest.mark.django_db
class TestLogin:
    def test_successful_login(self, api_client, create_user):
        """Test that a user can login with valid credentials"""
        url = reverse('auth:login')
        data = {
            'email': 'test@example.com',
            'password': 'StrongPassword123!',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
    
    def test_login_with_invalid_credentials(self, api_client, create_user):
        """Test that login fails with invalid credentials"""
        url = reverse('auth:login')
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword123!',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_login_inactive_user(self, api_client, inactive_user):
        """Test that login fails for inactive users"""
        url = reverse('auth:login')
        data = {
            'email': 'inactive@example.com',
            'password': 'StrongPassword123!',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestEmailVerification:
    def test_successful_verification(self, api_client, inactive_user):
        """Test that a user can verify their email"""
        url = reverse('auth:verify_email')
        
        # Generate verification token
        token = default_token_generator.make_token(inactive_user)
        uidb64 = urlsafe_base64_encode(force_bytes(inactive_user.pk))
        
        data = {
            'token': token,
            'uidb64': uidb64,
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Check that user is now active
        inactive_user.refresh_from_db()
        assert inactive_user.is_active
    
    def test_verification_with_invalid_token(self, api_client, inactive_user):
        """Test that verification fails with invalid token"""
        url = reverse('auth:verify_email')
        
        uidb64 = urlsafe_base64_encode(force_bytes(inactive_user.pk))
        
        data = {
            'token': 'invalid-token',
            'uidb64': uidb64,
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Check that user is still inactive
        inactive_user.refresh_from_db()
        assert not inactive_user.is_active


@pytest.mark.django_db
class TestPasswordReset:
    def test_password_reset_request_success(self, api_client, create_user):
        """Test that a user can request a password reset with proper email template"""
        url = reverse('auth:password_reset_request')
        data = {
            'email': 'test@example.com',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'Password reset email sent'
        
        # Check that one email was sent
        assert len(mail.outbox) == 1
        email = mail.outbox[0]
        
        # Verify email properties
        assert email.subject == 'Reset your password'
        assert email.to == ['test@example.com']
        assert email.from_email == f'Twitter Clone <{settings.DEFAULT_FROM_EMAIL}>'
        
        # Verify that the email contains the HTML template
        assert 'text/html' in email.alternatives[0][1]
        html_content = email.alternatives[0][0]
        
        # Check for key elements from our template
        assert '<title>Password Reset</title>' in html_content
        assert '<h1>Password Reset</h1>' in html_content
        assert 'class="button">Reset My Password</a>' in html_content
        assert 'Twitter Clone Built by' in html_content
        
        # Verify the reset URL is included
        assert settings.FRONTEND_URL in html_content
        assert '/reset-password/' in html_content
    
    def test_password_reset_request_nonexistent_email(self, api_client):
        """Test that password reset request with nonexistent email still returns 200"""
        url = reverse('auth:password_reset_request')
        data = {
            'email': 'nonexistent@example.com',
        }
        
        response = api_client.post(url, data, format='json')
        # Should still return 200 for security reasons
        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'Password reset email sent'
        # No email should be sent
        assert len(mail.outbox) == 0
    
    def test_password_reset_request_invalid_email_format(self, api_client):
        """Test that password reset request with invalid email format returns 400"""
        url = reverse('auth:password_reset_request')
        data = {
            'email': 'invalid-email',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
        assert len(mail.outbox) == 0
    
    def test_password_reset_confirm_success(self, api_client, create_user):
        """Test that a user can confirm a password reset"""
        # Generate reset token
        token = default_token_generator.make_token(create_user)
        uidb64 = urlsafe_base64_encode(force_bytes(create_user.pk))
        
        url = reverse('auth:password_reset_confirm')
        data = {
            'token': token,
            'uidb64': uidb64,
            'password': 'NewStrongPassword123!',
            'password2': 'NewStrongPassword123!',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['message'] == 'Password reset successful'
        
        # Verify user can login with new password
        login_url = reverse('auth:login')
        login_data = {
            'email': 'test@example.com',
            'password': 'NewStrongPassword123!',
        }
        
        login_response = api_client.post(login_url, login_data, format='json')
        assert login_response.status_code == status.HTTP_200_OK
        assert 'access' in login_response.data
    
    def test_password_reset_confirm_invalid_token(self, api_client, create_user):
        """Test that password reset fails with invalid token"""
        uidb64 = urlsafe_base64_encode(force_bytes(create_user.pk))
        
        url = reverse('auth:password_reset_confirm')
        data = {
            'token': 'invalid-token',
            'uidb64': uidb64,
            'password': 'NewStrongPassword123!',
            'password2': 'NewStrongPassword123!',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    def test_password_reset_confirm_passwords_dont_match(self, api_client, create_user):
        """Test that password reset fails when passwords don't match"""
        token = default_token_generator.make_token(create_user)
        uidb64 = urlsafe_base64_encode(force_bytes(create_user.pk))
        
        url = reverse('auth:password_reset_confirm')
        data = {
            'token': token,
            'uidb64': uidb64,
            'password': 'NewStrongPassword123!',
            'password2': 'DifferentPassword123!',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data
    
    def test_password_reset_confirm_weak_password(self, api_client, create_user):
        """Test that password reset fails with weak password"""
        token = default_token_generator.make_token(create_user)
        uidb64 = urlsafe_base64_encode(force_bytes(create_user.pk))
        
        url = reverse('auth:password_reset_confirm')
        data = {
            'token': token,
            'uidb64': uidb64,
            'password': 'weak',
            'password2': 'weak',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data


@pytest.mark.django_db
class TestLogout:
    def test_successful_logout(self, api_client, create_user):
        """Test that a user can logout successfully"""
        # Login first to get refresh token
        login_url = reverse('auth:login')
        login_data = {
            'email': 'test@example.com',
            'password': 'StrongPassword123!',
        }
        
        login_response = api_client.post(login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']
        access_token = login_response.data['access']
        
        # Set authorization header
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Logout
        logout_url = reverse('auth:logout')
        logout_data = {
            'refresh': refresh_token,
        }
        
        logout_response = api_client.post(logout_url, logout_data, format='json')
        assert logout_response.status_code == status.HTTP_205_RESET_CONTENT
        
        # Try to use the refresh token, which should now be invalid
        refresh_url = reverse('auth:token_refresh')
        refresh_data = {
            'refresh': refresh_token,
        }
        
        refresh_response = api_client.post(refresh_url, refresh_data, format='json')
        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED
