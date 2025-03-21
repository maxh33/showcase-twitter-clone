"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import sys
import os

# Add all possible project directories to the sys.path
paths = [
    '/home/maxh33/showcase-twitter-clone/backend',
    '/home/maxh33/showcase-twitter-clone'
]

for path in paths:
    if path not in sys.path:
        sys.path.append(path)

# Set environment variables
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
os.environ.setdefault('DEBUG', 'False')
os.environ.setdefault('ALLOWED_HOSTS', 'maxh33.pythonanywhere.com,localhost,127.0.0.1')
os.environ.setdefault('CORS_ALLOW_ALL_ORIGINS', 'True')
os.environ.setdefault('SECRET_KEY', 'django-insecure-$-t%@y85s$wl_ud2!o=(b2#(#(x+5x9!8-p6v&a&g#kn7+4bm-')  # Replace with a secure key in production

# Import the Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()