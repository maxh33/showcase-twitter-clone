# Twitter Clone **[Under Development]**

## Overview
This Showcase is a Twitter clone that implements core functionalities such as user authentication, tweet management, and notifications. The application is built using Django for the backend and React for the frontend, providing a seamless user experience.

## Features
- User authentication with JWT
- Registration and login functionality
  - Username supports letters, numbers, spaces, periods, underscores, and hyphens (3-30 characters)
  - Login with either username or email address
- Password reset and email verification
- Tweet creation, deletion, and interaction
- Real-time notifications
- Responsive design
- API documentation with Swagger/OpenAPI
- Secure database access with MySQL on production

## Tech Stack
- **Frontend**: React, TypeScript, styled-components
- **Backend**: Django, Django REST Framework, PostgreSQL (local), MySQL (production)
- **Testing**: Jest, Cypress for frontend; pytest for backend
- **Documentation**: Swagger/OpenAPI for API documentation
- **Deployment**: Docker, PythonAnywhere (backend), Vercel (frontend)

## Core Technologies
- **Django**: For building the backend API.
- **React**: For building the user interface.
- **PostgreSQL/MySQL**: As the database for storing user and tweet data.
- **JWT**: For secure user authentication.
- **OpenAPI/Swagger**: For API documentation.

## Architecture
The application follows a client-server architecture where the frontend communicates with the backend API to perform various operations. The backend handles data processing and business logic, while the frontend provides a user-friendly interface.

### Components
- **Frontend**: Contains all React components, services, and pages.
- **Backend**: Contains Django models, views, and serializers.

## API Documentation
The API is documented using Swagger/OpenAPI. You can access the documentation at:
- Swagger UI: `https://maxh33.pythonanywhere.com/swagger/`
- ReDoc: `https://maxh33.pythonanywhere.com/redoc/`

This provides an interactive way to explore and test the API endpoints.

## API Endpoints
The following API endpoints are available:

### Authentication
- `/api/v1/auth/register/` - Register a new user
  - Usernames must be 3-30 characters and can contain letters, numbers, spaces, periods, underscores, and hyphens
- `/api/v1/auth/login/` - Login with username or email
- `/api/v1/auth/logout/` - Logout and invalidate tokens
- `/api/v1/auth/token/refresh/` - Refresh an expired token
- `/api/v1/auth/password-reset/` - Request password reset
- `/api/v1/auth/password-reset/confirm/` - Confirm password reset
- `/api/v1/auth/verify-email/` - Verify email address

### Users
- `/api/v1/users/` - User profile endpoints (coming soon)

### Tweets
- `/api/v1/tweets/` - Tweet management endpoints (coming soon)

### Follows
- `/api/v1/follows/` - Follow/unfollow management (coming soon)

### Notifications
- `/api/v1/notifications/` - User notifications (coming soon)

## Testing Strategy
- **Unit Testing**: Comprehensive unit tests for models and authentication logic using pytest.
- **Integration Testing**: Tests for API endpoints and authentication flows.
- **End-to-End Testing**: Cypress tests for user interactions and flows.
- **API Testing**: Standalone scripts to validate endpoint functionality.

## Project Demo
![Login Page](frontend/public/login.png)
#
![Signup Page](frontend/public/signup.png)
#
![Email Validation](frontend/public/emailValidation.png)
#
![Password Reset](frontend/public/resetPW.png)
#
![Home Page](frontend/public/dummyHome.png)
#

## Deployment Infrastructure
The application is deployed using a CI/CD pipeline:
- **Backend**: Hosted on PythonAnywhere with automated deployment via GitHub Actions
  - MySQL database for production
  - Automatic migration and static file collection
  - Basic HTTP authentication for development
- **Frontend**: Deployed to Vercel with pre-built files from the CI/CD pipeline
  - Optimized build process
  - Environment-specific configuration

## Workflow
1. Clone the repository:
   ```bash
   git clone https://github.com/maxh33/showcase-twitter-clone.git
   cd showcase-twitter-clone
   ```

2. Set up the backend:
   - Navigate to the `backend` directory.
   - Install dependencies using Poetry:
     ```bash
     poetry install
     ```
   - Or using pip:
     ```bash
     pip install -r requirements.txt
     ```

3. Set up the frontend:
   - Navigate to the `frontend` directory.
   - Install dependencies using npm:
     ```bash
     npm install
     ```