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

// Import commands.js using ES2015 syntax:
import './commands'

// Import Chai and plugins
import chai from 'chai';
import chaiString from 'chai-string';

// Configure Chai
chai.use(chaiString);

// Add Chai to global namespace
declare global {
  export namespace Cypress {
    interface Chainable {
      // Add custom commands here
    }
  }
}

// Alternatively you can use CommonJS syntax:
// require('./commands') 