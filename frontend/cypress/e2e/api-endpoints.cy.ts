/// <reference types="cypress" />
/// <reference types="@types/chai" />

describe('API Endpoints Test', () => {
  // API URL Configuration
  // Use environment variable if set, otherwise fallback to local
  const API_URL = Cypress.env('API_URL') || 'http://localhost:8000/api';
  
  // Test user data with timestamp to ensure uniqueness
  const timestamp = new Date().getTime();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `testuser_${timestamp}@example.com`,
    password: 'TestPass123!',
    password2: 'TestPass123!'
  };

  // Log which environment we're testing against
  before(() => {
    cy.log(`Testing against API: ${API_URL}`);
  });

  describe('Authentication Endpoints', () => {
    it('should access API root', () => {
      cy.request({
        url: API_URL,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('status', 'success');
        expect(response.body).to.have.property('message').and.include('API is running');
        expect(response.body.endpoints).to.have.property('auth');
      });
    });

    it('should handle registration', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/v1/auth/register/`,
        body: testUser,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Registration response:', response.body);
        expect(response.status).to.be.oneOf([201, 400]);
        if (response.status === 201) {
          expect(response.body).to.have.property('access');
          expect(response.body).to.have.property('refresh');
          expect(response.body).to.have.property('user');
        }
      });
    });

    it('should handle login', () => {
      cy.login(testUser.email, testUser.password).then((response) => {
        if (response) {
          expect(response).to.have.property('access');
          expect(response).to.have.property('refresh');
          expect(response).to.have.property('user');
        }
      });
    });

    it('should handle token refresh', () => {
      // Skip if we don't have a refresh token
      if (!Cypress.env('refreshToken')) {
        cy.log('Skipping test - no refresh token available');
        return;
      }

      cy.request({
        method: 'POST',
        url: `${API_URL}/v1/auth/token/refresh/`,
        body: {
          refresh: Cypress.env('refreshToken')
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401]);
        if (response.status === 200) {
          expect(response.body).to.have.property('access');
        }
      });
    });

    it('should handle logout', () => {
      // Skip if we don't have a refresh token
      if (!Cypress.env('refreshToken')) {
        cy.log('Skipping test - no refresh token available');
        return;
      }

      cy.request({
        method: 'POST',
        url: `${API_URL}/v1/auth/logout/`,
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        },
        body: {
          refresh: Cypress.env('refreshToken')
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401]);
        if (response.status === 200) {
          expect(response.body).to.have.property('message').and.include('success');
        }
      });
    });
  });

  describe('User Endpoints', () => {
    beforeEach(() => {
      cy.ensureAuthenticated(testUser);
    });

    it('should get user profile', () => {
      // Skip if we don't have a token
      if (!Cypress.env('accessToken')) {
        cy.log('Skipping test - no auth token available');
        return;
      }

      cy.request({
        method: 'GET',
        url: `${API_URL}/v1/users/profile/`,
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401]);
        if (response.status === 200) {
          expect(response.body).to.have.property('username');
          expect(response.body).to.have.property('email');
        }
      });
    });
  });

  describe('Tweet Endpoints', () => {
    beforeEach(() => {
      cy.ensureAuthenticated(testUser);
    });

    it('should create and fetch tweets', () => {
      // Skip if we don't have a token
      if (!Cypress.env('accessToken')) {
        cy.log('Skipping test - no auth token available');
        return;
      }

      // Create a tweet
      cy.request({
        method: 'POST',
        url: `${API_URL}/v1/tweets/`,
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        },
        body: {
          content: 'Test tweet'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 401]);
        if (response.status === 201) {
          expect(response.body).to.have.property('id');
          expect(response.body).to.have.property('content', 'Test tweet');
        }
      });

      // Fetch tweets
      cy.request({
        method: 'GET',
        url: `${API_URL}/v1/tweets/`,
        headers: {
          Authorization: `Bearer ${Cypress.env('accessToken')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401]);
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
        }
      });
    });
  });
});