/// <reference types="cypress" />

describe('Demo User Functionality', () => {
  const API_URL = 'https://maxh33.pythonanywhere.com/api/v1';

  before(() => {
    // Clear localStorage
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should log in as demo user', () => {
    cy.visit('/login');
    cy.get('[data-cy="try-demo-button"]').click();
    
    // Wait for demo login to complete and redirect to home page
    cy.url().should('include', '/home');
    
    // Check if demo user flag is set in localStorage
    cy.window().then((win) => {
      cy.wrap(win.localStorage.getItem('isDemoUser')).should('eq', 'true');
    });
  });

  it('should show demo modal when demo user tries to post a tweet', () => {
    // Ensure we're still a demo user and logged in
    cy.window().then((win) => {
      if (win.localStorage.getItem('isDemoUser') !== 'true') {
        cy.visit('/login');
        cy.get('[data-cy="try-demo-button"]').click();
        cy.url().should('include', '/home');
      }
    });
    
    // Try to post a tweet
    cy.get('textarea[placeholder="What\'s happening?"]').type('This is a test tweet from a demo user');
    cy.contains('button', 'Tweet').click();
    
    // Verify demo modal appears
    cy.contains('Demo Account Limitation').should('be.visible');
    cy.contains('As a demo user, posting tweets is not available').should('be.visible');
    cy.contains('button', 'Sign Up for Free').should('be.visible');
    
    // Close the modal
    cy.contains('button', 'Continue with Demo').click();
    cy.contains('Demo Account Limitation').should('not.exist');
  });

  it('should navigate to signup page when clicking "Sign Up for Free" in demo modal', () => {
    // Ensure we're still a demo user and logged in
    cy.window().then((win) => {
      if (win.localStorage.getItem('isDemoUser') !== 'true') {
        cy.visit('/login');
        cy.get('[data-cy="try-demo-button"]').click();
        cy.url().should('include', '/home');
      }
    });
    
    // Try to post a tweet to trigger the demo modal
    cy.get('textarea[placeholder="What\'s happening?"]').type('Another test tweet from a demo user');
    cy.contains('button', 'Tweet').click();
    
    // Click the Sign Up button
    cy.contains('button', 'Sign Up for Free').click();
    
    // Verify we're redirected to signup page
    cy.url().should('include', '/signup');
  });
}); 