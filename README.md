# Twitter Clone **[Under Development]**

## Overview
This Showcase is a Twitter clone that implements core functionalities such as user authentication, tweet management, and notifications. The application is built using Django for the backend and React for the frontend, providing a seamless user experience.

## Features
- User authentication with JWT
- Registration and login functionality
- Password reset and email verification
- Tweet creation, deletion, and interaction
- Real-time notifications
- Responsive design
- API documentation with Swagger/OpenAPI

## Tech Stack
- **Frontend**: React, TypeScript, styled-components
- **Backend**: Django, Django REST Framework, PostgreSQL
- **Testing**: Jest, Cypress for frontend; pytest for backend
- **Documentation**: Swagger/OpenAPI for API documentation
- **Deployment**: Docker, PythonAnywhere (backend), Vercel (frontend)

## Core Technologies
- **Django**: For building the backend API.
- **React**: For building the user interface.
- **PostgreSQL**: As the database for storing user and tweet data.
- **JWT**: For secure user authentication.
- **OpenAPI/Swagger**: For API documentation.

## Architecture
The application follows a client-server architecture where the frontend communicates with the backend API to perform various operations. The backend handles data processing and business logic, while the frontend provides a user-friendly interface.

### Components
- **Frontend**: Contains all React components, services, and pages.
- **Backend**: Contains Django models, views, and serializers.

## API Documentation
The API is documented using Swagger/OpenAPI. You can access the documentation at:
- Swagger UI: `https://<backend-url>/swagger/`
- ReDoc: `https://<backend-url>/redoc/`

This provides an interactive way to explore and test the API endpoints.

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
- **Frontend**: Deployed to Vercel with pre-built files from the CI/CD pipeline

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

4. Run the application:
   - Start the backend server:
     ```bash
     poetry run python manage.py runserver
     ```
   - Start the frontend development server:
     ```bash
     npm start
     ```

## API Testing
The repository includes scripts for testing API endpoints:

1. Install test dependencies:
   ```bash
   pip install -r backend/tests/api/requirements.txt
   ```

2. Run the authentication endpoints test:
   ```bash
   python backend/tests/api/auth_endpoints_test.py
   ```

## How to Run
- Ensure you have Docker installed for local development.
- Use the provided `.env` files for environment variables.
- Follow the setup instructions above to run both the backend and frontend servers.
