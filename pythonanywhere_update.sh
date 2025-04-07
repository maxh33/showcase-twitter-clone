#!/bin/bash
# Twitter Clone PythonAnywhere Update Script
# Run this script on PythonAnywhere Bash console

echo "===== Twitter Clone Update Script ====="
echo "This script will update your PythonAnywhere deployment"

# Go to project directory
cd ~/showcase-twitter-clone

# Fetch latest changes
echo -e "\n===== Fetching latest changes ====="
git fetch
git status

# Pull the latest changes
echo -e "\n===== Pulling latest changes ====="
git pull

# Install required packages
echo -e "\n===== Installing required packages ====="
cd backend
pip install --user -r requirements.txt

# Run debug script for CORS
echo -e "\n===== Checking CORS configuration ====="
python manage.py shell < core/debug_cors.py

# Make migrations and migrate
echo -e "\n===== Running database migrations ====="
python manage.py makemigrations
python manage.py migrate

# Restart the web app
echo -e "\n===== Restarting the web app ====="
touch /var/www/maxh33_pythonanywhere_com_wsgi.py

echo -e "\n===== Update completed! ====="
echo "Your application should now be running with the latest changes."
echo "If you encounter any issues, please check the error log at:"
echo "/var/log/maxh33.pythonanywhere.com.error.log"
echo "You can also run: tail -f /var/log/maxh33.pythonanywhere.com.error.log" 