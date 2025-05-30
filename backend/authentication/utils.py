from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
import os
import random
import string
from datetime import datetime
import logging
from django.utils.html import strip_tags
import traceback

logger = logging.getLogger(__name__)

def send_password_reset_email(user_email, reset_url):
    """
    Send password reset email with HTML template
    """
    try:
        subject = 'Reset your password'
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = [user_email]
        
        # Render HTML content
        html_content = render_to_string('email/password_reset.html', {
            'reset_url': reset_url
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body='',  # Plain text version - empty as we're using HTML
            from_email=from_email,
            to=to_email
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Log email attempt
        logger.info(f"Attempting to send password reset email to {user_email}")
        logger.debug(f"SMTP Settings - Host: {settings.EMAIL_HOST}, Port: {settings.EMAIL_PORT}, User: {settings.EMAIL_HOST_USER}")
        
        # Send email with error handling
        msg.send(fail_silently=False)
        logger.info(f"Successfully sent password reset email to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user_email}. Error: {str(e)}")
        raise e

def send_verification_email(user_email, verification_url):
    """
    Send email verification with HTML template
    """
    try:
        subject = 'Verify your email address'
        from_email = 'Twitter Clone <services@maxhaider.dev>'
        to_email = [user_email]
        
        # Render HTML content
        html_content = render_to_string('email/email_verification.html', {
            'verification_url': verification_url
        })
        
        # Create email message
        msg = EmailMultiAlternatives(
            subject=subject,
            body='',  # Plain text version - empty as we're using HTML
            from_email=from_email,
            to=to_email
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Log email attempt
        logger.info(f"Attempting to send verification email to {user_email}")
        logger.debug(f"SMTP Settings - Host: {settings.EMAIL_HOST}, Port: {settings.EMAIL_PORT}, User: {settings.EMAIL_HOST_USER}")
        logger.debug(f"Using From Email: {from_email}")
        
        # Send email with error handling
        msg.send(fail_silently=False)
        logger.info(f"Successfully sent verification email to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {user_email}. Error: {str(e)}")
        raise e

def setup_demo_user(session_id=None):
    """
    Creates or returns a unique demo user account.
    
    If a session_id is provided, tries to create a unique demo account for that session.
    Otherwise, returns the default demo account.
    
    Args:
        session_id (str, optional): A unique identifier for the user session
        
    Returns:
        tuple: (user, created) - The user object and a boolean indicating if created
    """
    User = get_user_model()
    
    # Base demo user credentials (from env or fallbacks)
    base_email = os.environ.get('DEMO_USER_EMAIL', 'demo@twitterclone.com')
    base_username = os.environ.get('DEMO_USER_USERNAME', 'demo_user')
    demo_password = os.environ.get('DEMO_USER_PASSWORD', 'Demo@123')
    
    # If no session_id is provided, use the default demo account
    if not session_id:
        try:
            user = User.objects.get(email=base_email)
            # Make sure the is_demo_user is set to True
            if not getattr(user, 'is_demo_user', False):
                user.is_demo_user = True
                user.save(update_fields=['is_demo_user'])
            return user, False
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=base_username,
                email=base_email,
                password=demo_password,
                is_active=True,
                is_demo_user=True,
                bio='👋 This is a demo account. Some actions are restricted. Sign up to get full access!',
                location='Demo World 🌍'
            )
            return user, True
    
    # Create a unique suffix based on session_id
    # Generate a random suffix even with session_id to prevent username guessing
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    timestamp = timezone.now().strftime('%m%d%H%M')
    unique_suffix = f"{timestamp}_{random_suffix}"
    
    # Create unique credentials for this session
    email = base_email.replace('@', f"+{unique_suffix}@")
    username = f"{base_username}_{unique_suffix}"
    
    # Check if this unique demo user already exists
    try:
        user = User.objects.get(email=email)
        # Make sure the is_demo_user is set to True
        if not getattr(user, 'is_demo_user', False):
            user.is_demo_user = True
            user.save(update_fields=['is_demo_user'])
        return user, False
    except User.DoesNotExist:
        # Create a new unique demo user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=demo_password,
            is_active=True,
            is_demo_user=True,
            bio=f'👋 This is a unique demo account (#{unique_suffix}). Some actions are restricted. Sign up to get full access!',
            location='Demo World 🌍'
        )
        return user, True

def send_password_reset_success_email(email, login_url):
    """Send a password reset success notification email."""
    try:
        html_content = render_to_string('email/password_reset_success.html', {
            'login_url': login_url
        })
        text_content = strip_tags(html_content)
        
        email_message = EmailMultiAlternatives(
            'Password Reset Successful',
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )
        email_message.attach_alternative(html_content, "text/html")
        email_message.send(fail_silently=False)
        logger.info(f"Password reset success email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send password reset success email: {str(e)}")
        logger.error(f"Exception traceback: {traceback.format_exc()}")
        raise e

def send_account_activation_success_email(email, login_url):
    """Send an account activation success notification email."""
    try:
        html_content = render_to_string('email/account_activation_success.html', {
            'login_url': login_url
        })
        text_content = strip_tags(html_content)
        
        email_message = EmailMultiAlternatives(
            'Welcome to Twitter Clone - Account Activated!',
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )
        email_message.attach_alternative(html_content, "text/html")
        email_message.send(fail_silently=False)
        logger.info(f"Account activation success email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send account activation success email: {str(e)}")
        logger.error(f"Exception traceback: {traceback.format_exc()}")
        raise e
