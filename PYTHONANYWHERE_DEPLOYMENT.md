# PythonAnywhere Deployment Guide

This guide provides comprehensive instructions for deploying the Twitter Clone backend on PythonAnywhere.

## Overview

PythonAnywhere is used for deploying the backend component of this Twitter Clone. This guide covers:
- Setting up your web app
- Configuring the project structure
- Setting up the database
- Managing static and media files
- Troubleshooting common issues

## Step 1: Set Up Your Web App

1. Log in to your PythonAnywhere account.
2. Navigate to the **Web** tab in the dashboard.
3. Click **Add a new web app**.
4. Select **Manual configuration** and choose **Python 3.10**.

## Step 2: Clone the Repository

1. Go to the **Consoles** tab and start a new **Bash console**.
2. Run the following commands:
   ```bash
   # Go to home directory
   cd ~
   
   # Clone the repository
   git clone https://github.com/maxh33/showcase-twitter-clone.git
   
   # Navigate to the project directory
   cd showcase-twitter-clone
   ```

## Step 3: Project Structure

The recommended project structure is:

```
/home/maxh33/
└── showcase-twitter-clone/
    └── backend/
        ├── manage.py
        ├── media/
        ├── static/
        └── core/  # Django settings module
            ├── __init__.py
            ├── asgi.py
            ├── settings.py
            ├── urls.py
            └── wsgi.py
```

## Step 4: Install Dependencies

In the Bash console, run:
```bash
# Navigate to backend directory
cd ~/showcase-twitter-clone/backend

# Install dependencies using requirements.txt
pip install --user -r requirements.txt
```

If you have Poetry available, you can generate a requirements file:
```bash
# Install Poetry
pip install --user poetry

# Export dependencies to requirements.txt
poetry export -f requirements.txt --output requirements.txt --without-hashes

# Install dependencies
pip install --user -r requirements.txt
```

## Step 5: Configure the WSGI File

1. Go back to the **Web** tab.
2. Click on the link to edit your WSGI configuration file.
3. Replace the content with:
   ```python
   import os
   import sys
   
   # Add the project directory to sys.path
   path = '/home/maxh33/showcase-twitter-clone/backend'
   if path not in sys.path:
       sys.path.append(path)
   
   # Set environment variables
   os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
   os.environ['PYTHONANYWHERE'] = 'true'
   os.environ['DEBUG'] = 'False'
   os.environ['ALLOWED_HOSTS'] = 'maxh33.pythonanywhere.com,localhost,127.0.0.1'
   os.environ['CORS_ALLOW_ALL_ORIGINS'] = 'True'
   
   # Add MySQL password if using MySQL
   os.environ['MYSQL_PASSWORD'] = 'your_mysql_password'
   
   # Email configuration
   os.environ['EMAIL_HOST'] = 'smtp.your-email-provider.com'
   os.environ['EMAIL_PORT'] = '587'
   os.environ['EMAIL_HOST_USER'] = 'your-email@example.com'
   os.environ['EMAIL_HOST_PASSWORD'] = 'your-email-password'
   os.environ['EMAIL_USE_TLS'] = 'True'
   os.environ['DEFAULT_FROM_EMAIL'] = 'Twitter Clone <your-email@example.com>'
   
   # Frontend URLs
   os.environ['FRONTEND_URL'] = 'https://your-frontend-url.com'
   
   # Import Django's WSGI handler
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```

## Step 6: Create Static and Media Directories

In the Bash console, run:
```bash
# Create directories for static and media files
mkdir -p ~/showcase-twitter-clone/backend/static
mkdir -p ~/showcase-twitter-clone/backend/media
chmod 755 ~/showcase-twitter-clone/backend/static
chmod 755 ~/showcase-twitter-clone/backend/media
```

## Step 7: Configure Static Files

1. In the **Web** tab, scroll down to the **Static files** section.
2. Add these mappings:
   - URL: `/static/` → Directory: `/home/maxh33/showcase-twitter-clone/backend/static`
   - URL: `/media/` → Directory: `/home/maxh33/showcase-twitter-clone/backend/media`

## Step 8: Configure Database

The default configuration uses MySQL on PythonAnywhere:

1. Go to the **Databases** tab.
2. Note your MySQL database information:
   - Host: `yourusername.mysql.pythonanywhere-services.com`
   - Username: `yourusername`
   - Database: `yourusername$default`

The `settings.py` file should already be configured to use these settings when the `PYTHONANYWHERE` environment variable is set to `true`.

## Step 9: Run Database Migrations

In the Bash console, run:
```bash
# Navigate to backend directory
cd ~/showcase-twitter-clone/backend

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput
```

## Step 10: Reload Your Web App

1. Go to the **Web** tab.
2. Click the **Reload** button for your web app.

## Updating the App

To update the app after making changes to the repository:

1. Open a Bash console.
2. Run:
   ```bash
   cd ~/showcase-twitter-clone
   git pull
   cd backend
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```
3. Go to the **Web** tab and click **Reload**.

## Troubleshooting

### WSGI Import Errors

If you see ImportError or ModuleNotFoundError in your error logs:
1. Check that your path in the WSGI file is correct.
2. Verify the correct `DJANGO_SETTINGS_MODULE` environment variable.
3. Ensure all dependencies are installed correctly.

### Static Files Not Loading

1. Verify the static file mappings in the Web tab.
2. Check that the collectstatic command ran successfully.
3. Make sure the permissions on static directories are correct (755).

### Database Connection Issues

1. Verify the MySQL credentials in the WSGI file.
2. Check that the database exists and is accessible.
3. Ensure migrations have been applied correctly.

### 502 Bad Gateway Errors

1. Check the error logs in the Web tab.
2. Ensure your app doesn't exceed PythonAnywhere's resource limits.
3. Look for infinite loops or memory leaks in your code.

## CI/CD Deployment

For automated deployment, see the CI/CD Pipeline documentation in the CICD.md file, which includes details about deploying to PythonAnywhere using GitHub Actions. 