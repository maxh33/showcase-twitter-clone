# Twitter Clone Backend

This is the backend component of the Twitter Clone project, built with Django and Django REST Framework.

## Features

- User authentication with JWT
  - Username validation: 3-30 characters, allowing letters, numbers, spaces, periods, underscores, and hyphens
  - Login with either username or email
- Tweet management
  - Create, update, and delete tweets
  - Like and retweet functionality
  - Media attachments
  - Comments with media support
  - Feed generation
  - Search tweets by content or username
- User profiles
- Follow/unfollow functionality
- Notifications

## Technology Stack

- Python 3.10
- Django 4.2.11
- Django REST Framework
- PostgreSQL
- JWT Authentication (Simple JWT)

## API Endpoints

### Tweet endpoints

- `GET /api/v1/tweets/` - List all tweets
- `POST /api/v1/tweets/` - Create a new tweet
- `GET /api/v1/tweets/{id}/` - Get a specific tweet
- `PUT/PATCH /api/v1/tweets/{id}/` - Update a tweet
- `DELETE /api/v1/tweets/{id}/` - Delete a tweet
- `GET /api/v1/tweets/feed/` - Get tweets for home feed
- `GET /api/v1/tweets/user_tweets/?username={username}` - Get tweets from a specific user
- `GET /api/v1/tweets/search/?q={query}` - Search tweets
- `POST /api/v1/tweets/{id}/like/` - Like a tweet
- `POST /api/v1/tweets/{id}/retweet/` - Retweet a tweet
- `POST /api/v1/tweets/{id}/add_media/` - Add media to a tweet
- `GET /api/v1/tweets/{id}/comments/` - Get comments for a tweet
- `POST /api/v1/tweets/{id}/comments/` - Create a comment
- `PUT/PATCH /api/v1/tweets/{id}/comments/{comment_id}/` - Update a comment
- `DELETE /api/v1/tweets/{id}/comments/{comment_id}/` - Delete a comment
- `POST /api/v1/tweets/{id}/comments/{comment_id}/add_media/` - Add media to a comment

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
poetry run pytest --cov=.

# Run specific tests
poetry run pytest tests/api/test_tweets.py
```

## Deployment

See the root DEPLOYMENT.md file for instructions on deploying the backend to PythonAnywhere. 