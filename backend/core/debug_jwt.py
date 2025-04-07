"""
Debug utility to verify JWT settings and create test tokens.
Run this from the PythonAnywhere Bash console with:
python manage.py shell < core/debug_jwt.py
"""

import os
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User

print("\n=== JWT DEBUGGING UTILITY ===\n")

# Check JWT settings
print("JWT Settings:")
for key, value in settings.SIMPLE_JWT.items():
    print(f"{key} = {value}")

# Find demo user
try:
    demo_user = User.objects.get(email='demo@twitterclone.com')
    print(f"\nDemo user found: {demo_user.email}")
    
    # Generate fresh tokens
    refresh = RefreshToken.for_user(demo_user)
    print("\nNew JWT tokens for demo user:")
    print(f"Refresh token: {refresh}")
    print(f"Access token: {refresh.access_token}")
    
except User.DoesNotExist:
    print("\nDemo user not found - creating one")
    demo_user = User.objects.create_user(
        username="demouser",
        email="demo@twitterclone.com",
        password="Demo123!",
        is_demo_user=True
    )
    refresh = RefreshToken.for_user(demo_user)
    print("\nNew JWT tokens for demo user:")
    print(f"Refresh token: {refresh}")
    print(f"Access token: {refresh.access_token}")

print("\n=== END OF JWT DEBUGGING UTILITY ===\n")
