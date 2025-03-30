from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

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