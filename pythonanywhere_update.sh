#!/bin/bash
# Simple deployment script for PythonAnywhere
# Run this from a PythonAnywhere bash console

echo "=== Twitter Clone Deployment ==="
echo "Starting deployment process..."

# Go to project directory (create if not exists)
cd ~
if [ ! -d "showcase-twitter-clone" ]; then
  echo "Cloning repository..."
  git clone https://github.com/maxh33/showcase-twitter-clone.git
  cd showcase-twitter-clone
else
  echo "Repository exists, pulling latest changes..."
  cd showcase-twitter-clone
  git pull origin staging
fi

# Set up backend
cd backend
echo "Installing dependencies..."
pip install --user -r requirements.txt

# Ensure directories exist
mkdir -p showcase_twitter_clone/static showcase_twitter_clone/media
chmod 755 showcase_twitter_clone/static showcase_twitter_clone/media

# Set environment variables
export DJANGO_SETTINGS_MODULE=core.settings
export PYTHONANYWHERE=true
export DEBUG=False
export MYSQL_PASSWORD='your_mysql_password_here'  # Replace with your actual MySQL password

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Touch WSGI file to reload web app
echo "Reloading web application..."
touch /var/www/maxh33_pythonanywhere_com_wsgi.py

echo "=== Deployment completed! ==="
echo "Your application should now be live at https://maxh33.pythonanywhere.com/" 