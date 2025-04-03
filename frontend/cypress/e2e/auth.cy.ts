/// <reference types="cypress" />
/// <reference types="mocha" />
/// <reference types="chai" />

import { expect } from 'chai';
import '../support/commands';

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      intercept(method: string, url: string, response: any): Chainable<null>;
      wait(alias: string): Chainable<null>;
    }
  }
}

export {}; // Make this file a module

describe('Authentication', () => {
  // Generate a timestamp for unique test data
  const timestamp = new Date().getTime();

  beforeEach(() => {
    // Clear local storage and cookies before each test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Visit the page before each test
    cy.visit('/');
  });

  it('should register a new user', () => {
    // Mock registration API response
    cy.intercept('POST', '**/api/v1/auth/register/', {
      statusCode: 201,
      body: {
        message: 'User registered successfully. Please check your email to verify your account.'
      }
    }).as('register');

    // Navigate to signup page
    cy.contains('Sign up').should('be.visible').click();
    cy.url().should('include', '/signup');

    // Fill out registration form
    cy.get('input[name="username"]').should('be.visible').type('testuser');
    cy.get('input[name="email"]').should('be.visible').type('test@example.com');
    cy.get('input[name="password"]').should('be.visible').type('Password123!');
    cy.get('input[name="password_confirmation"]').should('be.visible').type('Password123!');

    // Submit form
    cy.contains('Sign up').should('be.visible').click();

    // Wait for API call
    cy.wait('@register');

    // Check for success message
    cy.contains('Registration successful! Please check your email to verify your account').should('be.visible');
  });

  it('should handle unverified user login', () => {
    // Navigate to login page
    cy.visit('/login');

    // Mock login API response for unverified user
    cy.intercept('POST', '**/api/v1/auth/login/', {
      statusCode: 400,
      body: {
        detail: 'Email not verified.'
      }
    }).as('login');

    // Mock resend verification API response
    cy.intercept('POST', '**/api/v1/auth/resend-verification/', {
      statusCode: 200,
      body: {
        message: 'Verification email sent successfully.'
      }
    }).as('resendVerification');

    // Fill out login form
    cy.get('input[name="identifier"]').should('be.visible').type('unverified@example.com');
    cy.get('input[name="password"]').should('be.visible').type('Password123!');

    // Submit form
    cy.contains('button', 'Log in').should('be.visible').click();

    // Wait for login API call
    cy.wait('@login');

    // Check for unverified account message
    cy.contains('Please verify your email address to log in.').should('be.visible');
    cy.contains('button', 'Resend Verification Email').should('be.visible').click();

    // Wait for resend verification API call
    cy.wait('@resendVerification');

    // Check for resend success message
    cy.contains('Verification email has been resent. Please check your inbox.').should('be.visible');
  });

  it('should login with demo account', () => {
    // Navigate to login page
    cy.visit('/login');

    // Mock demo login API response
    cy.intercept('POST', '**/api/v1/auth/demo-login/', {
      statusCode: 200,
      body: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'demo',
          email: 'demo@example.com'
        }
      }
    }).as('demoLogin');

    // Wait for the page to load and find the demo account button
    cy.contains('button', 'Try Demo Account', { timeout: 10000 }).should('be.visible').click();

    // Wait for demo login API call
    cy.wait('@demoLogin');

    // Check for successful login
    cy.url().should('include', '/home', { timeout: 10000 });
    cy.contains('Welcome').should('be.visible');
  });

  // Helper function to check email content in Docker logs
  const checkEmailInDockerLogs = (subject: string) => {
    cy.exec('docker logs showcase-twitter-clone-backend-1').then((result) => {
      const stdout = result.stdout.toLowerCase();
      const subject_lower = subject.toLowerCase();
      expect(stdout).to.contain(subject_lower);
      expect(stdout).to.contain('content-type: text/html');
    });
  };

  it('should verify emails are being sent with correct templates', () => {
    // Register new user and check verification email
    cy.visit('/signup');
    const verificationUser = {
      username: `emailtest${timestamp}`,
      email: `emailtest${timestamp}@example.com`,
      password: 'TestPass123!'
    };

    // Mock registration API response
    cy.intercept('POST', '**/api/v1/auth/register/', {
      statusCode: 201,
      body: {
        message: 'User registered successfully. Please check your email to verify your account.'
      }
    }).as('register');

    cy.get('input[name="username"]').type(verificationUser.username);
    cy.get('input[name="email"]').type(verificationUser.email);
    cy.get('input[name="password"]').type(verificationUser.password);
    cy.get('input[name="password_confirmation"]').type(verificationUser.password);
    cy.contains('button', 'Sign up').click();

    // Wait for registration API call
    cy.wait('@register');

    // Check Docker logs for verification email
    checkEmailInDockerLogs('welcome to twitter clone');

    // Mock password reset API response
    cy.intercept('POST', '**/api/v1/auth/reset-password/', {
      statusCode: 200,
      body: {
        message: 'Password reset email sent successfully.'
      }
    }).as('resetPassword');

    // Request password reset and check email
    cy.visit('/reset-password');
    cy.get('input[name="email"]').type(verificationUser.email);
    cy.contains('button', 'Reset Password').click();

    // Wait for password reset API call
    cy.wait('@resetPassword');

    // Check Docker logs for password reset email
    checkEmailInDockerLogs('password reset');
  });
}); 