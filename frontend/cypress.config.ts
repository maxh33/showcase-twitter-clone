import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      // Default to local API
      API_URL: 'http://localhost:8000/api/v1',
      // Production API (can be overridden via CLI or cypress.env.json)
      PROD_API_URL: 'https://maxh33.pythonanywhere.com/api/v1'
    }
  }
}); 