from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth import get_user_model
import os
import random
import string
from datetime import datetime

def send_password_reset_email(user_email, reset_url):
    """
    Send password reset email with HTML template
    """
    subject = 'Reset your password'
    from_email = f'Twitter Clone <{settings.DEFAULT_FROM_EMAIL}>'
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
    msg.send(fail_silently=False)

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
            return user, False
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=base_username,
                email=base_email,
                password=demo_password,
                is_active=True,
                bio='👋 This is a demo account. Some actions are restricted. Sign up to get full access!',
                location='Demo World 🌍'
            )
            return user, True
    
    # Create a unique suffix based on session_id
    # Generate a random suffix even with session_id to prevent username guessing
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    timestamp = datetime.now().strftime('%m%d%H%M')
    unique_suffix = f"{timestamp}_{random_suffix}"
    
    # Create unique credentials for this session
    email = base_email.replace('@', f"+{unique_suffix}@")
    username = f"{base_username}_{unique_suffix}"
    
    # Check if this unique demo user already exists
    try:
        user = User.objects.get(email=email)
        return user, False
    except User.DoesNotExist:
        # Create a new unique demo user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=demo_password,
            is_active=True,
            bio=f'👋 This is a unique demo account (#{unique_suffix}). Some actions are restricted. Sign up to get full access!',
            location='Demo World 🌍'
        )
        return user, True 