import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://maxh33.pythonanywhere.com',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
}); 