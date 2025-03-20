# Testing Documentation

This document outlines how to run the various tests for the Twitter Clone project.

## Backend Testing

The backend uses pytest along with pytest-cov for coverage reporting.

### Prerequisites

Make sure you have installed all the required packages:

```bash
cd backend
poetry install
```

### Running the Tests

To run the backend tests with coverage reporting:

```bash
cd backend
chmod +x run_tests.sh
./run_tests.sh
```

Alternatively, you can run:

```bash
cd backend
poetry run python -m pytest --cov=. --cov-report=term-missing --cov-report=html
```

This will run all the tests and generate a coverage report in both the terminal and as an HTML report in the `htmlcov` directory.

### Test Structure

- The tests are organized by app and functionality
- Fixtures are used to set up common test data
- API endpoints are tested with Django REST Framework's test client

## Frontend Testing

The frontend uses Jest for unit and integration tests, and Cypress for end-to-end tests.

### Prerequisites

Make sure you have installed all the required packages:

```bash
cd frontend
npm install
```

### Running Unit/Integration Tests

To run the Jest tests:

```bash
cd frontend
npm test
```

To run with coverage:

```bash
cd frontend
npm test -- --coverage
```

### Running End-to-End Tests

To run the Cypress tests in headless mode against the local environment:

```bash
cd frontend
npx cypress run
```

To run tests against the production environment:

```bash
cd frontend
npx cypress run --env API_URL=https://maxh33.pythonanywhere.com/api
```

To open the Cypress test runner UI:

```bash
cd frontend
npx cypress open
```

### Test Environments

The E2E tests can be run against different environments:

- **Local Development**: Uses `http://localhost:8000/api` (default)
- **Production**: Uses `https://maxh33.pythonanywhere.com/api`

To switch environments, you can:

1. Use the command line flag:
   ```bash
   npx cypress run --env API_URL=https://maxh33.pythonanywhere.com/api
   ```

2. Create a `cypress.env.json` file:
   ```json
   {
     "API_URL": "https://maxh33.pythonanywhere.com/api"
   }
   ```

3. Or modify `cypress.config.ts` directly.

### Test Structure

- Unit/Integration tests:
  - Located in `__tests__` directories alongside the code they're testing
  - Use Jest and axios-mock-adapter to mock API calls
  - Focus on testing service methods and component behavior

- End-to-End tests:
  - Located in `cypress/e2e`
  - Focus on testing complete user flows
  - Use Cypress fixtures and interceptors to mock API responses
  - Support testing against both local and production environments

## Authentication Testing

The authentication testing focuses on ensuring that the frontend auth service works correctly with the backend API. Key aspects tested include:

1. User registration
2. Login/logout
3. JWT token management
4. Email verification
5. Password reset
6. Token refreshing

## Running All Tests

To run all tests for the project:

```bash
# Backend tests
cd backend
./run_tests.sh

# Frontend unit/integration tests
cd ../frontend
npm test -- --coverage

# Frontend E2E tests
npx cypress run
``` 