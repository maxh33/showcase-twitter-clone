# Deployment Guide

This document provides instructions for deploying the Twitter Clone application to production environments. Our setup uses PythonAnywhere for the backend and Vercel for the frontend.

## Prerequisites

- GitHub account with access to the repository
- PythonAnywhere account (free plan)
- Vercel account (free plan)
- Access to repository secrets on GitHub

## Backend Deployment on PythonAnywhere

### First-Time Setup

1. **Create a PythonAnywhere account**
   - Sign up at https://www.pythonanywhere.com/ (free tier is sufficient)

2. **Create a new Web App**
   - Go to the Dashboard and click on "Web" tab
   - Click "Add a new web app"
   - Choose "Manual configuration"
   - Select Python 3.10 (same version as in the PythonAnywhere account)
   - Set your domain name (will be something like `yourusername.pythonanywhere.com`)

3. **Clone the repository**
   ```bash
   # From the PythonAnywhere bash console
   cd ~
   git clone https://github.com/yourusername/showcase-twitter-clone.git
   cd showcase-twitter-clone
   ```

4. **Install dependencies globally**
   ```bash
   # From the PythonAnywhere bash console
   cd ~/showcase-twitter-clone/backend
   pip install --user -r requirements.txt
   # Alternatively, if you're using Poetry
   pip install --user poetry
   poetry export -f requirements.txt --output requirements.txt --without-hashes
   pip install --user -r requirements.txt
   ```

5. **Configure environment variables**
   - Go to the "Web" tab in the PythonAnywhere dashboard
   - Under the "Code" section, add these variables to the WSGI configuration file:
   ```python
   # Add these at the top of the wsgi file
   import os
   os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
   os.environ['DEBUG'] = 'False'
   os.environ['SECRET_KEY'] = 'your-secure-secret-key'
   os.environ['DATABASE_URL'] = 'postgres://username:password@hostname/database_name'
   os.environ['ALLOWED_HOSTS'] = 'yourusername.pythonanywhere.com'
   os.environ['CORS_ALLOWED_ORIGINS'] = 'https://your-vercel-app.vercel.app'
   ```

6. **Configure the WSGI file**
   - Find your WSGI file path in the PythonAnywhere dashboard under the "Web" tab
   - Edit the file to include this code:
   ```python
   import sys
   import os
   
   # Add your project directory to the sys.path
   path = '/home/yourusername/showcase-twitter-clone/backend'
   if path not in sys.path:
       sys.path.append(path)
   
   # Set environment variables
   os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
   
   # Import the Django WSGI application
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```

7. **Set up the database**
   - Go to the "Databases" tab and create a new PostgreSQL database
   - Note the database name, username, password, and hostname
   - Run migrations:
   ```bash
   # From the PythonAnywhere bash console
   cd ~/showcase-twitter-clone/backend
   python manage.py migrate
   ```

8. **Configure static files**
   - Go to the "Web" tab
   - Under "Static files", add:
     - URL: `/static/`
     - Directory: `/home/yourusername/showcase-twitter-clone/backend/staticfiles/`
   - Collect static files:
   ```bash
   cd ~/showcase-twitter-clone/backend
   python manage.py collectstatic --noinput
   ```

9. **Reload the web app**
    - Click the "Reload" button on the Web tab

### CI/CD Secret Configuration for GitHub Actions

When using the non-virtual environment approach, update these secrets in your GitHub repository:

- `PYTHONANYWHERE_HOST`: Your PythonAnywhere hostname (typically ssh.pythonanywhere.com)
- `PYTHONANYWHERE_USERNAME`: Your PythonAnywhere username
- `PYTHONANYWHERE_PASSWORD`: Your PythonAnywhere account password
- `PYTHONANYWHERE_PROJECT_PATH`: The path to your project (e.g., /home/yourusername/showcase-twitter-clone)
- `PYTHONANYWHERE_WSGI_PATH`: The path to your WSGI file (shown in the PythonAnywhere Web tab)

## Frontend Deployment on Vercel

### First-Time Setup

1. **Create a Vercel account**
   - Sign up at https://vercel.com/ (free tier is sufficient)
   - Connect your GitHub account

2. **Import your project**
   - Click "Add New..." > "Project"
   - Select your GitHub repository
   - Set the "Framework Preset" to "Create React App"
   - Configure the "Root Directory" to `frontend`

3. **Set environment variables**
   - Add these variables in the Vercel project settings:
     - `REACT_APP_API_URL`: Your backend API URL (e.g., https://yourusername.pythonanywhere.com/api)

4. **Deploy**
   - Click "Deploy"

### CI/CD Secret Configuration for GitHub Actions

Add these secrets to your GitHub repository:

- `VERCEL_TOKEN`: Generate from your Vercel account (Account Settings > Tokens)
- `VERCEL_ORG_ID`: Find in your Vercel account settings
- `VERCEL_PROJECT_ID`: Find in your project settings on Vercel

## Continuous Deployment

Once the CI/CD pipeline is set up, deployment will happen automatically when changes are pushed to the main branch:

1. The GitHub Actions workflow will run tests
2. If tests pass, it will build both frontend and backend
3. It will deploy the backend to PythonAnywhere
4. It will deploy the frontend to Vercel

## Manual Deployment (If Needed)

### Backend to PythonAnywhere

```bash
# Log into PythonAnywhere via SSH or use the bash console
cd ~/showcase-twitter-clone
git pull
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
# Reload the web app from the PythonAnywhere dashboard
```

### Frontend to Vercel

```bash
# From your local machine
cd frontend
npm run build
npx vercel --prod
```

## Troubleshooting

### Backend Deployment Issues

1. **WSGI Import Errors**
   - Check the error logs in PythonAnywhere dashboard
   - Ensure the path in the WSGI file is correct
   - Verify all dependencies are installed

2. **Database Connection Issues**
   - Verify the DATABASE_URL environment variable
   - Check if your database is running and accessible

3. **Static Files Not Loading**
   - Ensure collectstatic has been run
   - Check the static files configuration in the PythonAnywhere dashboard

### Frontend Deployment Issues

1. **API Connection Issues**
   - Verify the REACT_APP_API_URL environment variable
   - Check CORS settings in the backend

2. **Build Failures**
   - Review the build logs in Vercel
   - Test the build locally with `npm run build`

3. **Environment Variable Issues**
   - Ensure all required variables are set in Vercel 