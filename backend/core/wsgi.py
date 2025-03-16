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
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

# Import the Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()