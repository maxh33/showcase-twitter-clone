# Deployment Guide

This document provides high-level instructions for deploying the Twitter Clone application to production environments. Our setup uses PythonAnywhere for the backend and Vercel for the frontend.

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
   - Select Python 3.10

3. **Follow the detailed setup guide**
   - For step-by-step instructions, see [PYTHONANYWHERE_DEPLOYMENT.md](PYTHONANYWHERE_DEPLOYMENT.md)

### MySQL Database Configuration

PythonAnywhere free tier includes a MySQL database with these settings:
- Host: `maxh33.mysql.pythonanywhere-services.com`
- Username: `maxh33`
- Database: `maxh33$default`

These settings are automatically configured in the Django application when the `PYTHONANYWHERE` environment variable is set to `true`.

### CI/CD Secret Configuration for GitHub Actions

For GitHub Actions to deploy to PythonAnywhere, add these secrets to your repository:

- `PYTHONANYWHERE_API_TOKEN`: API token from PythonAnywhere (Account → API Token)
- `PYTHONANYWHERE_USERNAME`: Your PythonAnywhere username
- `DJANGO_SECRET_KEY`: A secure secret key for Django
- `MYSQL_PASSWORD`: Your MySQL database password

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
     - `REACT_APP_API_URL`: Your backend API URL (e.g., https://maxh33.pythonanywhere.com/api)

### CI/CD Secret Configuration for GitHub Actions

Add these secrets to your GitHub repository:

- `VERCEL_TOKEN`: Generate from your Vercel account (Account Settings > Tokens)
- `VERCEL_ORG_ID`: Find in your Vercel account settings
- `VERCEL_PROJECT_ID`: Find in your project settings on Vercel

## GitHub Actions Workflow

Our CI/CD pipeline handles:

1. **Testing**: Runs tests for both frontend and backend
2. **Building**: Creates optimized builds
3. **Deployment**: Deploys to PythonAnywhere and Vercel

The workflow is configured in `.github/workflows/ci-cd.yml` and will run automatically on push to main or staging branches.

## Manual Deployment (If Needed)

### Backend to PythonAnywhere

If you need to deploy manually:

1. Open a Bash console on PythonAnywhere
2. Run:
   ```bash
   cd ~/showcase-twitter-clone
   git pull
   cd backend
   pip install --user -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```
3. Go to the Web tab and click "Reload"

### Frontend to Vercel

Our current workflow pre-builds the frontend files before deployment, so you shouldn't need to manually build them.

## Troubleshooting

For detailed troubleshooting of PythonAnywhere deployment issues, please refer to the [PYTHONANYWHERE_DEPLOYMENT.md](PYTHONANYWHERE_DEPLOYMENT.md) document. 