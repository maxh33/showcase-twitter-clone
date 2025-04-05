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
    def is_blocked(cls, email, ip_address):
        """
        Check if access is blocked due to too many failed attempts from an email or IP.
        
        Args:
            email: The email that was attempted
            ip_address: The IP address where the attempt came from
            
        Returns:
            bool: True if access should be blocked, False otherwise
        """
        # Get failed attempts in the last hour
        one_hour_ago = timezone.now() - timedelta(hours=1)
        
        # Check email-based attempts
        if email:
            email_attempts = cls.objects.filter(
                email=email,
                timestamp__gte=one_hour_ago
            ).count()
            if email_attempts >= 20:  # Limit for email
                return True
                
        # Check IP-based attempts
        ip_attempts = cls.objects.filter(
            ip_address=ip_address,
            timestamp__gte=one_hour_ago
        ).count()
        return ip_attempts >= 100  # Higher limit for IP to avoid blocking legitimate users sharing IPs
    
    @classmethod
    def clear_failed_attempts(cls, email):
        """Clear all failed login attempts for a user after successful login"""
        cls.objects.filter(email=email).delete()
