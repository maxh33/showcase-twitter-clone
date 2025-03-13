describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Intercept API requests
    cy.intercept('POST', '**/api/auth/register/', {
      statusCode: 201,
      body: {
        message: 'User registered successfully. Please check your email to verify your account.',
      },
    }).as('register');

    cy.intercept('POST', '**/api/auth/login/', {
      statusCode: 200,
      body: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          bio: 'Test bio',
          location: 'Test location',
          profile_picture: null,
          followers_count: 0,
          following_count: 0,
        },
      },
    }).as('login');

    cy.intercept('POST', '**/api/auth/logout/', {
      statusCode: 205,
      body: {},
    }).as('logout');

    cy.intercept('POST', '**/api/auth/password-reset/', {
      statusCode: 200,
      body: {
        message: 'Password reset email sent',
      },
    }).as('resetPassword');

    cy.intercept('POST', '**/api/auth/verify-email/', {
      statusCode: 200,
      body: {
        message: 'Email verified successfully',
      },
    }).as('verifyEmail');
  });

  it('should register a new user', () => {
    cy.visit('/signup');
    
    // Fill in registration form
    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    cy.get('[data-testid="password2-input"]').type('Password123!');
    
    // Submit form
    cy.get('[data-testid="register-button"]').click();
    
    // Wait for the request to complete
    cy.wait('@register');
    
    // Check if redirected to login or verification page
    cy.url().should('include', '/login');
    
    // Check for success message
    cy.get('[data-testid="alert-success"]').should('be.visible');
  });

  it('should login a user successfully', () => {
    cy.visit('/login');
    
    // Fill in login form
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('Password123!');
    
    // Submit form
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for the request to complete
    cy.wait('@login');
    
    // Check if redirected to home page
    cy.url().should('include', '/home');
    
    // Check if localStorage has tokens
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.eq('mock-access-token');
      expect(window.localStorage.getItem('refreshToken')).to.eq('mock-refresh-token');
    });
  });

  it('should handle login error', () => {
    // Override the login intercept to return an error
    cy.intercept('POST', '**/api/auth/login/', {
      statusCode: 401,
      body: {
        detail: 'No active account found with the given credentials',
      },
    }).as('loginError');
    
    cy.visit('/login');
    
    // Fill in login form with incorrect credentials
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('WrongPassword');
    
    // Submit form
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for the request to complete
    cy.wait('@loginError');
    
    // Check for error message
    cy.get('[data-testid="alert-error"]').should('be.visible');
    
    // Check that we're still on the login page
    cy.url().should('include', '/login');
  });

  it('should logout a user successfully', () => {
    // Login first
    cy.window().then((window) => {
      window.localStorage.setItem('token', 'mock-access-token');
      window.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });
    
    cy.visit('/home');
    
    // Click logout button
    cy.get('[data-testid="logout-button"]').click();
    
    // Wait for the request to complete
    cy.wait('@logout');
    
    // Check if redirected to login page
    cy.url().should('include', '/login');
    
    // Check if localStorage tokens are cleared
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.be.null;
      expect(window.localStorage.getItem('refreshToken')).to.be.null;
    });
  });

  it('should request password reset', () => {
    cy.visit('/reset-password');
    
    // Fill in email
    cy.get('[data-testid="email-input"]').type('test@example.com');
    
    // Submit form
    cy.get('[data-testid="reset-password-button"]').click();
    
    // Wait for the request to complete
    cy.wait('@resetPassword');
    
    // Check for success message
    cy.get('[data-testid="alert-success"]').should('be.visible');
  });

  it('should verify email successfully', () => {
    // Simulate navigating to verification URL
    cy.visit('/verify-email?token=mock-token&uidb64=mock-uidb64');
    
    // Wait for the verification request
    cy.wait('@verifyEmail');
    
    // Check for success message
    cy.get('[data-testid="alert-success"]').should('be.visible');
    
    // Check if redirected to login page
    cy.url().should('include', '/login');
  });
}); 