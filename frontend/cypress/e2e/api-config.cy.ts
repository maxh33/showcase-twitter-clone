describe('API Configuration Check', () => {
  it('should be using the correct API URL', () => {
    // Visit the application
    cy.visit('/');
    
    // Add custom command to expose environment variables
    cy.window().then((win) => {
      // Add a debug element to check environment variables
      const debugDiv = win.document.createElement('div');
      debugDiv.id = 'api-debug';
      debugDiv.style.display = 'none';
      
      // Expose the API URL from the environment
      debugDiv.setAttribute('data-api-url', process.env.REACT_APP_API_URL || 'not-set');
      
      // Expose the actual API URL being used in the code
      const apiUrlBeingUsed = win.localStorage.getItem('debug-api-url') || 'unknown';
      debugDiv.setAttribute('data-actual-api-url', apiUrlBeingUsed);
      
      win.document.body.appendChild(debugDiv);
    });
    
    // Check the API URL configuration
    cy.get('#api-debug').then(($el) => {
      const configuredApiUrl = $el.attr('data-api-url');
      const actualApiUrl = $el.attr('data-actual-api-url');
      
      cy.log(`Configured API URL: ${configuredApiUrl}`);
      cy.log(`Actual API URL being used: ${actualApiUrl}`);
      
      // Make sure it's not localhost in production
      if (Cypress.env('NODE_ENV') === 'production') {
        expect(actualApiUrl).not.to.include('localhost');
        expect(actualApiUrl).to.include('pythonanywhere.com');
      }
    });
    
    // Check network requests (optional - if your app makes any requests on load)
    cy.intercept('**/api/**').as('apiRequest');
    cy.wait('@apiRequest', { timeout: 10000 }).then((interception) => {
      cy.log(`API Request URL: ${interception.request.url}`);
      
      // In production, should not be localhost
      if (Cypress.env('NODE_ENV') === 'production') {
        expect(interception.request.url).not.to.include('localhost');
        expect(interception.request.url).to.include('pythonanywhere.com');
      }
    });
  });
}); 