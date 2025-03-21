# PythonAnywhere Setup Guide

This guide provides simplified instructions for deploying the Twitter Clone on PythonAnywhere using their web interface tools.

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

## Step 3: Install Dependencies

In the Bash console, run:
```bash
# Navigate to backend directory
cd ~/showcase-twitter-clone/backend

# Install dependencies
pip install --user -r requirements.txt
```

## Step 4: Configure the WSGI File

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
   os.environ['DEBUG'] = 'False'
   os.environ['ALLOWED_HOSTS'] = 'maxh33.pythonanywhere.com'
   os.environ['PYTHONANYWHERE'] = 'true'
   
   # Import Django's WSGI handler
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```

## Step 5: Create Static and Media Directories

In the Bash console, run:
```bash
# Create directories for static and media files
mkdir -p ~/showcase-twitter-clone/backend/static
mkdir -p ~/showcase-twitter-clone/backend/media
```

## Step 6: Configure Static Files

1. In the **Web** tab, scroll down to the **Static files** section.
2. Add these mappings:
   - URL: `/static/` → Directory: `/home/maxh33/showcase-twitter-clone/backend/static`
   - URL: `/media/` → Directory: `/home/maxh33/showcase-twitter-clone/backend/media`

## Step 7: Run Database Migrations

In the Bash console, run:
```bash
# Navigate to backend directory
cd ~/showcase-twitter-clone/backend

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput
```

## Step 8: Configure MySQL Database

The MySQL database should already be set up with:
- Host: `maxh33.mysql.pythonanywhere-services.com`
- Username: `maxh33`
- Database: `maxh33$default`

No further configuration is needed as the `settings.py` file is already configured to use these settings when the `PYTHONANYWHERE` environment variable is set to `true`.

## Step 9: Reload Your Web App

1. Go to the **Web** tab.
2. Click the **Reload** button for your web app.

## Troubleshooting

If you encounter issues:

1. Check the error logs in the **Web** tab.
2. Verify your WSGI file configuration.
3. Make sure all required directories exist.
4. Check that the Django settings are correctly configured for MySQL.

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
