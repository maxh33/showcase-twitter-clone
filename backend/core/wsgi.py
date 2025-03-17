"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import sys
import os

# Add your project directory to the sys.path
path = '/home/maxh33/showcase-twitter-clone/backend'
if path not in sys.path:
    sys.path.append(path)

# Set environment variables
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
os.environ.setdefault('DEBUG', 'False')
os.environ.setdefault('ALLOWED_HOSTS', 'maxh33.pythonanywhere.com,localhost,127.0.0.1')
os.environ.setdefault('CORS_ALLOW_ALL_ORIGINS', 'True')
# Note: In production, you should set SECRET_KEY in the PythonAnywhere dashboard
# or in the actual WSGI file on the server, not in this version-controlled file

# Import the Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()