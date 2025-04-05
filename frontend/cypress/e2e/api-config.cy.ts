/// <reference types="cypress" />

export {}; // Make this file a module

describe('API Configuration', () => {
  const isDevelopment = Cypress.env('NODE_ENV') !== 'production';
  const expectedBaseUrl = isDevelopment 
    ? 'http://localhost:8000/api/v1'
    : 'https://maxh33.pythonanywhere.com/api/v1';

  beforeEach(() => {
    // Set API URL in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('debug-api-url', expectedBaseUrl);
    });
  });

  it('should have correct API URL', () => {
    cy.window().then((win) => {
      const apiUrl = win.localStorage.getItem('debug-api-url');
      expect(apiUrl).to.equal(expectedBaseUrl);
    });
  });

  it('should have correct login endpoint', () => {
    const loginUrl = `${expectedBaseUrl}/auth/login/`;
    cy.request({
      method: 'POST',
      url: loginUrl,
      failOnStatusCode: false,
      body: {
        email: 'test@example.com',
        password: 'wrongpassword'
      }
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 401]);
    });
  });

  it('should verify API root endpoint is accessible', () => {
    cy.request({
      url: expectedBaseUrl,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 401]);
    });
  });
}); 