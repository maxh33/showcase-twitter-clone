# API Testing Scripts

This directory contains scripts for testing the Twitter Clone API endpoints.

## Authentication Endpoint Test

The `auth_endpoints_test.py` script validates that all authentication-related endpoints are accessible and functioning correctly.

### Security Best Practices

⚠️ **IMPORTANT:** This script requires authentication credentials for PythonAnywhere (if you set some up). Follow these security guidelines:

1. **NEVER** commit credentials to the repository
2. **NEVER** hardcode credentials in scripts
3. **ALWAYS** use environment variables for sensitive information
4. For PythonAnywhere deployment details, see [PYTHONANYWHERE_DEPLOYMENT.md](../PYTHONANYWHERE_DEPLOYMENT.md)

### Running the Test

1. Set the required environment variables:

   ```bash
   # On Windows PowerShell
   $env:PYTHONANYWHERE_USERNAME = "your_username"
   $env:PYTHONANYWHERE_PASSWORD = "your_password"
   
   # On Linux/macOS
   export PYTHONANYWHERE_USERNAME="your_username"
   export PYTHONANYWHERE_PASSWORD="your_password"
   ```

2. Run the test script:

   ```bash
   python tests/auth_endpoints_test.py
   ```

3. The script will output the status of each API endpoint.

### Creating a `.env` File (Optional)

For local development, you can create a `.env` file at the root of the project (but **DO NOT commit it**):

```
PYTHONANYWHERE_USERNAME=your_username
PYTHONANYWHERE_PASSWORD=your_password
```

Then use a package like `python-dotenv` to load these variables:

```python
from dotenv import load_dotenv
load_dotenv()  # Load .env file
```

Make sure to add `.env` to your `.gitignore` file. 