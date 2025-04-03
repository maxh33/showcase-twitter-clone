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
  const API_URL = Cypress.env('API_URL') || 'http://localhost:8000/api/v1';
  
  return cy.request({
    method: 'POST',
    url: `${API_URL}/auth/login/`,
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
    interface Chainable<Subject = any> {
      login(email: string, password: string): Chainable<LoginResponse | null>;
      ensureAuthenticated(testUser: { email: string; password: string }): Chainable<void>;
      intercept(method: string, url: string, response: any): Chainable<null>;
      wait(alias: string): Chainable<null>;
      request(options: any): Chainable<any>;
      exec(command: string): Chainable<{ stdout: string; stderr: string; code: number }>;
      url(): Chainable<string>;
      contains(content: string): Chainable<JQuery<HTMLElement>>;
      get(selector: string): Chainable<JQuery<HTMLElement>>;
      clearLocalStorage(): Chainable<void>;
      clearCookies(): Chainable<void>;
      visit(url: string): Chainable<void>;
      log(message: string): void;
    }
  }
} 