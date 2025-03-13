from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class FailedLoginAttempt(models.Model):
    """
    Model to track failed login attempts for account lockout.
    """
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def record_failed_attempt(cls, username, ip_address):
        """Record a failed login attempt"""
        cls.objects.create(username=username, ip_address=ip_address)
    
    @classmethod
    def is_account_locked(cls, username, ip_address, max_attempts=5, lockout_duration=15):
        """
        Check if an account is locked due to too many failed attempts.
        
        Args:
            username: The username that was attempted
            ip_address: The IP address of the request
            max_attempts: Maximum number of attempts before lockout
            lockout_duration: Lockout duration in minutes
            
        Returns:
            bool: True if the account is locked, False otherwise
        """
        # Get timestamp for lockout window
        lockout_window = timezone.now() - timedelta(minutes=lockout_duration)
        
        # Count recent failed attempts
        recent_attempts = cls.objects.filter(
            username=username,
            timestamp__gte=lockout_window
        ).count()
        
        return recent_attempts >= max_attempts
    
    @classmethod
    def clear_failed_attempts(cls, username):
        """Clear all failed login attempts for a user after successful login"""
        cls.objects.filter(username=username).delete()
