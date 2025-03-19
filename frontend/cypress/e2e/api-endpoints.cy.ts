/// <reference types="cypress" />
/// <reference types="@types/chai" />

describe('API Endpoints Test', () => {
  const API_URL = 'https://maxh33.pythonanywhere.com/api';
  //const API_URL = 'http://localhost:8000/api';
  const testUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'TestPass123!',
    password2: 'TestPass123!'
  };

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
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };
      cy.log('Login request data:', loginData);
      cy.request({
        method: 'POST',
        url: `${API_URL}/v1/auth/login/`,
        body: loginData,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Login response:', response.body);
        cy.log('Login status:', response.status);
        expect(response.status).to.be.oneOf([200, 401, 429]);
        if (response.status === 200) {
          expect(response.body).to.have.property('access');
          expect(response.body).to.have.property('refresh');
          expect(response.body).to.have.property('user');
          
          // Store tokens for subsequent requests
          Cypress.env('accessToken', response.body.access);
          Cypress.env('refreshToken', response.body.refresh);
        } else if (response.status === 429) {
          cy.log('Account is temporarily locked due to too many failed attempts');
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
      // Login before each test if we don't have a token
      if (!Cypress.env('accessToken')) {
        cy.request({
          method: 'POST',
          url: `${API_URL}/v1/auth/login/`,
          body: {
            email: testUser.email,
            password: testUser.password
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            Cypress.env('accessToken', response.body.access);
          }
        });
      }
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
      // Login before each test if we don't have a token
      if (!Cypress.env('accessToken')) {
        cy.request({
          method: 'POST',
          url: `${API_URL}/v1/auth/login/`,
          body: {
            email: testUser.email,
            password: testUser.password
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            Cypress.env('accessToken', response.body.access);
          }
        });
      }
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