import requests
import json
import os
from requests.auth import HTTPBasicAuth
from pathlib import Path

# Try to load .env file if it exists
try:
    from dotenv import load_dotenv
    # Load from project root .env file (3 levels up from current file)
    env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
    print("Loaded environment variables from .env file")
except ImportError:
    print("python-dotenv not installed. Using environment variables directly.")
    print("To install: pip install python-dotenv")

BASE_URL = "https://maxh33.pythonanywhere.com"

# Get credentials from environment variables
# NEVER hardcode credentials in source code
BASIC_AUTH_USER = os.environ.get("PYTHONANYWHERE_USERNAME")
BASIC_AUTH_PASSWORD = os.environ.get("PYTHONANYWHERE_PASSWORD")

endpoints = [
    "/api/v1/auth/register/",
    "/api/v1/auth/login/",
    "/api/v1/auth/logout/",
    "/api/v1/auth/token/refresh/",
    "/api/v1/auth/password-reset/",
    "/api/v1/auth/password-reset/confirm/",
    "/api/v1/auth/verify-email/"
]

def test_endpoints():
    # Check if credentials are available
    if not BASIC_AUTH_USER or not BASIC_AUTH_PASSWORD:
        print("ERROR: Authentication credentials not found in environment variables.")
        print("Please set PYTHONANYWHERE_USERNAME and PYTHONANYWHERE_PASSWORD environment variables.")
        return
        
    results = {}
    for endpoint in endpoints:
        url = BASE_URL + endpoint
        try:
            # Use OPTIONS request with basic auth to check endpoint existence
            response = requests.options(
                url, 
                auth=HTTPBasicAuth(BASIC_AUTH_USER, BASIC_AUTH_PASSWORD)
            )
            
            if response.status_code in [200, 204, 400, 401, 403]:  # These status codes indicate endpoint exists
                results[endpoint] = f"✅ Exists (Status: {response.status_code})"
            else:
                results[endpoint] = f"❌ Issue (Status: {response.status_code})"
        except requests.RequestException as e:
            results[endpoint] = f"❌ Error: {str(e)}"
    
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    test_endpoints() 