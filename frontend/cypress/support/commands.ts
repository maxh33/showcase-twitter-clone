// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

interface LoginResponse {
  access: string;
  refresh: string;
  user: any;
}

// -- This is a parent command --
Cypress.Commands.add('login', (email: string, password: string) => {
  const API_URL = Cypress.env('API_URL') || 'http://localhost:8000/api';
  
  return cy.request({
    method: 'POST',
    url: `${API_URL}/v1/auth/login/`,
    body: { email, password },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      // Store tokens in Cypress environment
      Cypress.env('accessToken', response.body.access);
      Cypress.env('refreshToken', response.body.refresh);
      return response.body;
    }
    return null;
  });
});

// Command to ensure user is authenticated
Cypress.Commands.add('ensureAuthenticated', (testUser: { email: string; password: string }) => {
  // Check if we already have a token
  if (Cypress.env('accessToken')) {
    return;
  }

  // If no token, try to login
  cy.login(testUser.email, testUser.password);
});

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<LoginResponse | null>
      ensureAuthenticated(testUser: { email: string; password: string }): Chainable<void>
    }
  }
} 