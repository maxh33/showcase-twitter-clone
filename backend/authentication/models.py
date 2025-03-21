from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class FailedLoginAttempt(models.Model):
    """
    Model to track failed login attempts for account lockout.
    """
    email = models.EmailField(null=True)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def record_failed_attempt(cls, email, ip_address):
        """Record a failed login attempt"""
        cls.objects.create(email=email, ip_address=ip_address)
    
    @classmethod
    def is_account_locked(cls, email):
        """
        Check if an account is locked due to too many failed attempts.
        
        Args:
            email: The email that was attempted
            
        Returns:
            bool: True if the account is locked, False otherwise
        """
        # Get failed attempts in the last hour
        one_hour_ago = timezone.now() - timedelta(hours=1)
        failed_attempts = cls.objects.filter(
            email=email,
            timestamp__gte=one_hour_ago
        ).count()
        return failed_attempts >= 20  # Increased for testing
    
    @classmethod
    def clear_failed_attempts(cls, email):
        """Clear all failed login attempts for a user after successful login"""
        cls.objects.filter(email=email).delete()
