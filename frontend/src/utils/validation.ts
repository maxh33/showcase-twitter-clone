// Validation utility functions for form validation

/**
 * Email validation function
 * @param email Email to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation - checks if password meets requirements
 * @param password Password string to validate
 * @returns boolean indicating if password is valid
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates username format
 * @param username Username to validate
 * @returns boolean indicating if username is valid
 */
export const isValidUsername = (username: string): boolean => {
  // Allow letters, numbers, underscores and hyphens, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};
