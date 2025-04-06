import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { resendVerification } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import * as S from '../components/Auth/styles';
import loginBanner from '../assets/images/signupBanner.png';
import blackLogo from '../assets/icons/blackIcon.png';

interface LocationState {
  message?: string;
}

interface ErrorResponse {
  response?: {
    data?: Record<string, unknown>;
  };
  message?: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    identifier: '', // This can be either username or email
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { demoLogin, login: contextLogin } = useAuth(); // Get both login and demoLogin from auth context
  
  // Check for success message from registration or other sources
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clear the state after showing the message
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if the error response indicates an unverified account
  const checkForUnverifiedAccount = (errorData: Record<string, unknown>, isEmail: boolean): boolean => {
    if (
      'requires_verification' in errorData ||
      (typeof errorData.detail === 'string' && errorData.detail.includes('not been verified')) ||
      (errorData.detail === 'Email not verified.') || 
      (typeof errorData.non_field_errors === 'string' && errorData.non_field_errors.includes('not verified')) ||
      (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors[0]?.includes('not verified'))
    ) {
      const emailFromResponse = errorData.email as string;
      const emailToDisplay = emailFromResponse || (isEmail ? formData.identifier : null);
      setUnverifiedEmail(emailToDisplay);
      
      // Show the unverified account UI
      setIsUnverified(true);
      
      // Create a user-friendly message that clearly instructs the user
      const emailDisplay = emailToDisplay ? ` (${emailToDisplay})` : '';
      const detailMessage = 
        `🔑 Account Activation Required${emailDisplay}

A new activation link has been sent to your email address.

✅ Check your inbox and spam folder
✅ Click the verification link in the email
✅ Return to this page to log in

If you don't receive the email within a few minutes, you can click the 'Resend Verification Email' button below.`;
      
      // Set the formatted error message and success message
      setErrors({ general: detailMessage });
      setSuccessMessage('A new verification link has been sent to your email address.');
      
      return true;
    }
    return false;
  };

  // Process various error types from the API response
  const processApiErrors = (errorData: Record<string, unknown>): void => {
    if (errorData.email || errorData.username) {
      setErrors({ 
        identifier: String(errorData.email || errorData.username) 
      });
    } else if (errorData.detail) {
      setErrors({ general: String(errorData.detail) });
    } else if (errorData.non_field_errors) {
      const nonFieldErrors = errorData.non_field_errors;
      if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
        setErrors({ general: String(nonFieldErrors[0]) });
      } else {
        setErrors({ general: String(nonFieldErrors) });
      }
    } else {
      // Convert all values to strings
      const stringErrors: Record<string, string> = {};
      Object.entries(errorData).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          stringErrors[key] = String(value[0]);
        } else {
          stringErrors[key] = String(value);
        }
      });
      setErrors(stringErrors);
    }
  };

  // Handle login errors by processing the error response
  const handleLoginError = (error: unknown, isEmail: boolean): void => {
    console.error('Login error:', error);
    
    // Cast to a type with the expected shape for easier handling
    const errorObj = error as ErrorResponse;
    
    if (errorObj?.response?.data && typeof errorObj.response.data === 'object') {
      const errorData = errorObj.response.data as Record<string, unknown>;
      
      // Check for unverified account first
      const isUnverifiedAccount = checkForUnverifiedAccount(errorData, isEmail);
      setIsUnverified(isUnverifiedAccount);
      
      if (!isUnverifiedAccount) {
        // Process other API error types
        processApiErrors(errorData);
      }
    } else if (errorObj?.message) {
      // Handle errors with just a message property
      setErrors({ general: errorObj.message });
    } else {
      // Generic fallback error
      setErrors({ general: 'Unable to log in. Please check your credentials and try again.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setIsUnverified(false);
    setUnverifiedEmail(null);
    
    // Determine if identifier is an email or username
    const isEmail = formData.identifier.includes('@');
    
    try {
      // Use the login from context instead of the imported function
      await contextLogin(formData.identifier, formData.password);
      console.log('Login successful, navigating to home page...');
      navigate('/'); // Redirect to home page after successful login
    } catch (error: unknown) {
      handleLoginError(error, isEmail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      await demoLogin();
      navigate('/'); // Redirect to home page after successful demo login
    } catch (error: unknown) {
      console.error('Demo login error:', error);
      
      if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'An error occurred during demo login. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) {
      setErrors({ general: 'Please enter your email address to resend verification.' });
      return;
    }

    setIsResendingVerification(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      await resendVerification({ email: unverifiedEmail });
      setSuccessMessage('Verification email has been resent. Please check your inbox.');
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Failed to resend verification email. Please try again.' });
      }
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <S.AuthContainer>
      <S.BannerContainer>
        <S.BannerImage src={loginBanner} alt="Login banner" />
      </S.BannerContainer>
      
      <S.FormContainer>
        <S.LogoContainer>
          <S.Logo src={blackLogo} alt="Twitter Clone Logo" />
        </S.LogoContainer>
        
        <S.FormTitle>Log in to Twitter Clone</S.FormTitle>
        
        {successMessage && <S.SuccessMessage>{successMessage}</S.SuccessMessage>}
        {errors.general && <S.ErrorMessage>{errors.general}</S.ErrorMessage>}
        
        <S.Form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label htmlFor="identifier">Username or Email</S.Label>
            <S.Input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your username or email"
            />
            {errors.identifier && <S.ErrorMessage>{errors.identifier}</S.ErrorMessage>}
          </S.FormGroup>
          
          <S.FormGroup>
            <S.Label htmlFor="password">Password</S.Label>
            <S.Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && <S.ErrorMessage>{errors.password}</S.ErrorMessage>}
          </S.FormGroup>
          
          <S.ButtonContainer>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </S.ButtonContainer>
        </S.Form>

        <S.ButtonContainer style={{ marginTop: '16px' }}>
          {isUnverified && (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleResendVerification}
              disabled={isResendingVerification || !unverifiedEmail}
              style={{ marginBottom: '10px' }}
            >
              {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Try Demo Account'}
          </Button>
        </S.ButtonContainer>
        
        <S.LinkContainer>
          <S.LinkText>
            <Link to="/reset-password">Forgot password?</Link>
          </S.LinkText>
        </S.LinkContainer>
        
        <S.LinkContainer>
          <S.LinkText>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </S.LinkText>
        </S.LinkContainer>
      </S.FormContainer>
    </S.AuthContainer>
  );
};

export default LoginPage; 