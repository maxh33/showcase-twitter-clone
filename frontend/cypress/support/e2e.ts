// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands';

// Import Chai and plugins
import chai from 'chai';
import chaiString from 'chai-string';

// Configure Chai
chai.use(chaiString);

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here
      login(email: string, password: string): void;
      logout(): void;
    }
  }
}

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="identifier"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.contains('Logout').click();
  cy.url().should('include', '/login');
});

// Alternatively you can use CommonJS syntax:
// require('./commands') 