from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth import get_user_model

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

def setup_demo_user():
    """
    Creates or updates the demo user account.
    
    This function creates a demo user with predefined credentials
    or updates an existing demo user to ensure it has the correct
    properties and is active.
    
    Returns:
        tuple: (user, created) - The user object and a boolean indicating if created
    """
    User = get_user_model()
    demo_email = 'demo@twitterclone.com'
    demo_username = 'demo_user'
    demo_password = 'Demo@123'  # This is just for demo purposes
    
    created = False
    try:
        user = User.objects.get(email=demo_email)
        user.username = demo_username
        user.set_password(demo_password)
        user.is_active = True
        user.save()
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=demo_username,
            email=demo_email,
            password=demo_password,
            is_active=True,
            bio='👋 This is a demo account. Some actions are restricted. Sign up to get full access!',
            location='Demo World 🌍'
        )
        created = True
    
    return user, created 