# Twitter Clone Backend

This is the backend component of the Twitter Clone project, built with Django and Django REST Framework.

## Features

- User authentication with JWT
  - Username validation: 3-30 characters, allowing letters, numbers, spaces, periods, underscores, and hyphens
  - Login with either username or email
- Tweet management
- User profiles
- Follow/unfollow functionality
- Notifications

## Technology Stack

- Python 3.10
- Django 4.0.6
- Django REST Framework
- PostgreSQL
- JWT Authentication (Simple JWT)

## Development

```bash
# Install dependencies
poetry install

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

## Testing

```bash
# Run tests with coverage
pytest --cov=.
```

## Deployment

See the root DEPLOYMENT.md file for instructions on deploying the backend to PythonAnywhere. 