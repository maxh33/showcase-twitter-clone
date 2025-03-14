# CI/CD Pipeline Documentation

This document explains the Continuous Integration and Continuous Deployment (CI/CD) pipeline set up for the Twitter Clone project.

## Overview

Our CI/CD pipeline automates the testing, building, and deployment process, ensuring that code changes are verified before being deployed to production. The pipeline is implemented using GitHub Actions and consists of several stages:

1. **Code Testing**
   - Backend tests with pytest
   - Frontend tests with Jest
   - End-to-end tests with Cypress

2. **Building**
   - Backend package compilation
   - Frontend static file generation

3. **Deployment**
   - Backend deployment to PythonAnywhere
   - Frontend deployment to Vercel

## GitHub Actions Workflow

The pipeline is defined in `.github/workflows/ci-cd.yml` and runs automatically on:
- Push to the main branch
- Pull requests targeting the main branch
- Manual triggers (workflow_dispatch)

## Workflow Jobs

### 1. Backend Tests

This job sets up a PostgreSQL database and runs the backend tests:

- **Environment**: Ubuntu with Python 3.9
- **Services**: PostgreSQL 13
- **Steps**:
  - Check out the code
  - Set up Python
  - Install Poetry
  - Install dependencies
  - Configure environment variables
  - Run migrations
  - Run tests with coverage reporting
  - Upload test coverage results

### 2. Frontend Tests

This job runs the frontend tests:

- **Environment**: Ubuntu with Node.js 20
- **Steps**:
  - Check out the code
  - Set up Node.js
  - Install dependencies
  - Configure environment variables
  - Run linting checks
  - Run unit and integration tests
  - Run end-to-end tests with Cypress
  - Upload test coverage results

### 3. Build

This job runs after the test jobs complete successfully and only on pushes to the main branch:

- **Environment**: Ubuntu with Node.js 20 and Python 3.9
- **Steps**:
  - Build the frontend application
  - Archive the frontend build artifacts
  - Install backend dependencies
  - Archive the backend application files

### 4. Deploy Backend

This job deploys the backend to PythonAnywhere:

- **Environment**: Ubuntu
- **Steps**:
  - Download backend artifacts
  - SSH into PythonAnywhere
  - Update code from Git
  - Install dependencies
  - Run migrations
  - Reload the application

### 5. Deploy Frontend

This job deploys the frontend to Vercel:

- **Environment**: Ubuntu
- **Steps**:
  - Download frontend build artifacts
  - Install Vercel CLI
  - Deploy to Vercel

## Secret Management

The workflow uses the following secrets that need to be configured in the GitHub repository settings:

### PythonAnywhere Secrets
- `PYTHONANYWHERE_HOST`: The hostname for SSH access
- `PYTHONANYWHERE_USERNAME`: Your PythonAnywhere username
- `PYTHONANYWHERE_PASSWORD`: Your PythonAnywhere password
- `PYTHONANYWHERE_PROJECT_PATH`: Path to the project on PythonAnywhere
- `PYTHONANYWHERE_VENV_PATH`: Path to the virtual environment
- `PYTHONANYWHERE_WSGI_PATH`: Path to the WSGI file

### Vercel Secrets
- `VERCEL_TOKEN`: Authentication token for Vercel
- `VERCEL_ORG_ID`: Your organization ID on Vercel
- `VERCEL_PROJECT_ID`: The project ID on Vercel

## Docker Setup

For production deployment, we have created Dockerfiles that can be used for containerization:

### Backend Dockerfile (backend/Dockerfile.prod)
- Base image: Python 3.9 slim
- Uses Poetry for dependency management
- Uses Gunicorn as the production web server
- Collects static files during the build process

### Frontend Dockerfile (frontend/Dockerfile.prod)
- Multi-stage build:
  - Stage 1: Node.js 20 to build the React application
  - Stage 2: Nginx to serve the static files
- Optimized for production use

## Local Development

For local development, we maintain a docker-compose.yml file at the root of the project that orchestrates:
- Backend service with Django development server
- Frontend service with React development server
- PostgreSQL database

To start the local development environment:

```bash
docker-compose up
```

## Monitoring and Troubleshooting

### GitHub Actions
- View workflow runs in the "Actions" tab of the GitHub repository
- Check logs for each job to diagnose issues

### PythonAnywhere
- Check the error logs in the PythonAnywhere dashboard
- Use the bash console for debugging

### Vercel
- View deployment logs in the Vercel dashboard
- Use the Vercel CLI for local debugging

## Best Practices Implemented

1. **Test-Driven Development**
   - All code changes are tested before deployment

2. **Environment Isolation**
   - Development, testing, and production environments are separated

3. **Infrastructure as Code**
   - All deployment configurations are defined in code

4. **Continuous Feedback**
   - Test results and deployment statuses are reported back to GitHub

5. **Automated Database Migrations**
   - Database schema changes are applied automatically

## Future Improvements

1. **Environment-Specific Deployments**
   - Add staging environment
   - Implement feature branch previews

2. **Advanced Testing**
   - Add load testing
   - Implement UI visual regression testing

3. **Monitoring and Alerting**
   - Add application performance monitoring
   - Set up alert notifications

4. **Security Enhancements**
   - Implement security scanning with Snyk
   - Add dependency vulnerability checks 