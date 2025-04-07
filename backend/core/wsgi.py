"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import socket

# Check if we're on PythonAnywhere
if 'pythonanywhere.com' in socket.gethostname():
    os.environ.setdefault('PYTHONANYWHERE', 'true')
    # You can set MySQL password here if needed
    # os.environ.setdefault('MYSQL_PASSWORD', 'your_actual_password')

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

application = get_wsgi_application()