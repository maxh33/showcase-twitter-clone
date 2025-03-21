# Testing Guide

This document provides guidance for testing the Twitter Clone application.

## Unit Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

## E2E Testing with Cypress

```bash
cd frontend
npx cypress open  # For interactive testing
npx cypress run   # For headless testing
```

## Testing Environments

You can run tests against different environments:

### Local API Testing
```bash
cd frontend
npx cypress run --spec "cypress/e2e/api-endpoints.cy.ts"
```

### Production API Testing
```bash
cd frontend
npx cypress run --spec "cypress/e2e/api-endpoints.cy.ts" --env API_URL=https://maxh33.pythonanywhere.com/api
```

## Test Cases

### User Authentication

#### Username Validation
- Usernames must be 3-30 characters long
- Allowed characters: letters, numbers, spaces, periods, underscores, and hyphens
- Cannot be empty or contain non-allowed characters
- Cannot be already in use

Valid username examples:
- `john_doe`
- `jane.doe`
- `John Doe`
- `user-123`

Invalid username examples:
- `jo` (too short)
- `thisusernameiswaytoolongandexceedsthirtycharacters` (too long)
- `user@name` (contains @ symbol)
- `admin` (reserved name)

#### Email Validation
- Must be in valid email format
- Cannot be already in use

#### Password Validation
- Must be at least 8 characters
- Must include uppercase, lowercase, digit, and special character
- Passwords must match when confirming

### Login Testing
- Users should be able to login with either username or email
- Invalid credentials should display appropriate error messages

### API Testing
The complete authentication flow can be tested using the provided Cypress tests. 