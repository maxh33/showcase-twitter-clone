"""
Debug utility to verify CORS settings in Django on PythonAnywhere.
Run this from the PythonAnywhere Bash console with:
python manage.py shell < core/debug_cors.py
"""

import os
import sys
from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.test.client import RequestFactory

print("\n=== CORS DEBUGGING UTILITY ===\n")

# Check environment variables
print("Environment Variables:")
print(f"DEBUG = {os.environ.get('DEBUG', 'Not set')}")
print(f"CORS_ALLOW_ALL_ORIGINS = {os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'Not set')}")

# Check settings
print("\nDjango Settings:")
print(f"DEBUG = {settings.DEBUG}")
print(f"CORS_ALLOW_ALL_ORIGINS = {getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', 'Not found')}")
print(f"CORS_ALLOWED_ORIGINS = {getattr(settings, 'CORS_ALLOWED_ORIGINS', 'Not found')}")
print(f"CORS_ORIGIN_REGEX_WHITELIST = {getattr(settings, 'CORS_ORIGIN_REGEX_WHITELIST', 'Not found')}")

# Test middleware order
print("\nMiddleware Order:")
for i, middleware in enumerate(settings.MIDDLEWARE):
    print(f"{i+1}. {middleware}")

# Create a test request
print("\nTesting CORS Headers with Custom Middleware:")
factory = RequestFactory()

# Test OPTIONS request for preflight
test_origin = "https://showcase-twitter-clone-maxh33-maxh33s-projects.vercel.app"
options_req = factory.options('/api/v1/tweets/', 
                           HTTP_ORIGIN=test_origin,
                           HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST')

# Our custom middleware
try:
    from core.middleware import CustomCorsMiddleware
    middleware = CustomCorsMiddleware(lambda req: HttpResponse())
    options_response = middleware(options_req)
    
    print("\nCORS Headers for OPTIONS (preflight) request:")
    for key, value in options_response.items():
        if key.startswith('Access-Control'):
            print(f"{key}: {value}")
    
    # Test a regular POST request
    post_req = factory.post('/api/v1/tweets/', 
                           HTTP_ORIGIN=test_origin)
    post_response = middleware(post_req)
    
    print("\nCORS Headers for POST request:")
    for key, value in post_response.items():
        if key.startswith('Access-Control'):
            print(f"{key}: {value}")
            
    # Test if origin is actually being checked correctly
    print("\nOrigin check test:")
    print(f"Test origin: {test_origin}")
    print(f"In CORS_ALLOWED_ORIGINS: {test_origin in getattr(settings, 'CORS_ALLOWED_ORIGINS', [])}")
    
    import re
    for pattern in getattr(settings, 'CORS_ORIGIN_REGEX_WHITELIST', []):
        compiled_pattern = re.compile(pattern)
        match = compiled_pattern.match(test_origin)
        print(f"Matches pattern '{pattern}': {bool(match)}")
        
except ImportError:
    print("CustomCorsMiddleware not found. Make sure core/middleware.py exists.")
except Exception as e:
    print(f"Error testing middleware: {e}")

print("\n=== END OF CORS DEBUGGING UTILITY ===\n") 