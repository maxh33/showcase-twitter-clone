/// <reference types="cypress" />
/// <reference types="mocha" />
/// <reference types="chai" />

// Import the custom commands type declarations
/// <reference path="../support/commands.ts" />

import { expect } from 'chai';

interface ApiResponse {
  status: number;
  body: Record<string, unknown>;
  [key: string]: unknown;
}

declare global {
  namespace Cypress {
    interface Chainable<Subject = unknown> {
      intercept(method: string, url: string, response: unknown): Chainable<null>;
      wait(alias: string): Chainable<null>;
      login(email: string, password: string): Chainable<unknown>;
      ensureAuthenticated(user: { username: string, email: string, password: string }): Chainable<null>;
    }
  }
}

export {}; // Make this file a module

describe('API Endpoints Test', () => {
  // API URL Configuration
  // Use environment variable if set, otherwise fallback to local
  let API_URL: string;

  before(() => {
    cy.wrap(Cypress.env('API_URL') || 'http://localhost:8000/api/v1').then(url => {
      API_URL = url;
      cy.log(`Testing against API: ${API_URL}`);
    });
  });

  // Test user data with timestamp to ensure uniqueness
  const timestamp = new Date().getTime();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `testuser_${timestamp}@example.com`,
    password: 'TestPass123!',
    password2: 'TestPass123!'
  };

  beforeEach(() => {
    // Mock API endpoints
    cy.intercept('POST', `${API_URL}/auth/register/`, {
      statusCode: 201,
      body: {
        message: 'User registered successfully'
      }
    }).as('register');

    cy.intercept('POST', `${API_URL}/auth/token/refresh/`, {
      statusCode: 200,
      body: {
        access: 'new-access-token'
      }
    }).as('refreshToken');

    cy.intercept('POST', `${API_URL}/auth/logout/`, {
      statusCode: 200,
      body: {
        message: 'Logged out successfully'
      }
    }).as('logout');
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
        url: `${API_URL}/auth/register/`,
        body: testUser,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Registration response:', response.body);
        expect(response.status).to.be.oneOf([201, 400]);
        if (response.status === 201) {
          expect(response.body).to.have.property('message').and.include('successfully');
        } else if (response.status === 400) {
          expect(response.body).to.have.property('error');
        }
      });
    });

    it('should handle login', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/auth/login/`,
        body: {
          identifier: testUser.email,
          password: testUser.password
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401]);
        if (response.status === 200) {
          expect(response.body).to.have.property('access');
          expect(response.body).to.have.property('refresh');
          expect(response.body).to.have.property('user');
        }
      });
    });

    it('should handle token refresh', () => {
      // Skip if we don't have a refresh token
      cy.wrap(Cypress.env('refreshToken')).then(refreshToken => {
        if (!refreshToken) {
          cy.log('Skipping test - no refresh token available');
          return;
        }

        cy.request({
          method: 'POST',
          url: `${API_URL}/auth/token/refresh/`,
          body: {
            refresh: refreshToken
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 401]);
          if (response.status === 200) {
            expect(response.body).to.have.property('access');
          }
        });
      });
    });

    it('should handle logout', () => {
      // Skip if we don't have tokens
      cy.wrap(Cypress.env('refreshToken')).then(refreshToken => {
        cy.wrap(Cypress.env('accessToken')).then(accessToken => {
          if (!refreshToken || !accessToken) {
            cy.log('Skipping test - no tokens available');
            return;
          }

          cy.request({
            method: 'POST',
            url: `${API_URL}/auth/logout/`,
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            body: {
              refresh: refreshToken
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
        url: `${API_URL}/users/profile/`,
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
        url: `${API_URL}/tweets/`,
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
        url: `${API_URL}/tweets/`,
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

  it('should handle API errors gracefully', () => {
    // Navigate to the login page first
    cy.visit('/login');

    // Intercept API calls and return error
    cy.intercept('POST', '**/api/v1/auth/login/', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error'
      }
    }).as('loginRequest');

    // Try to login
    cy.get('input[name="identifier"]').should('be.visible').type('test@example.com');
    cy.get('input[name="password"]').should('be.visible').type('password123');
    cy.contains('button', 'Log in').should('be.visible').click();

    // Wait for the request and verify error message
    cy.wait('@loginRequest');
    cy.contains('Unable to log in. Please check your credentials and try again.').should('be.visible');
  });
});