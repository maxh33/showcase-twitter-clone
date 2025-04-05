import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { login, demoLogin, resendVerification } from '../services/authService';
import {
  AuthContainer,
  BannerContainer,
  BannerImage,
  FormContainer,
  LogoContainer,
  Logo,
  FormTitle,
  Form,
  FormGroup,
  Label,
  Input,
  ButtonContainer,
  LinkContainer,
  LinkText,
  ErrorMessage,
  SuccessMessage
} from '../components/Auth/styles';
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
      errorData.requires_verification === true || 
      (typeof errorData.detail === 'string' && errorData.detail.includes('not been verified')) ||
      (errorData.detail === 'Email not verified.') || 
      (typeof errorData.non_field_errors === 'string' && errorData.non_field_errors.includes('not verified')) ||
      (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors[0]?.includes('not verified'))
    ) {
      const emailFromResponse = errorData.email as string;
      setUnverifiedEmail(emailFromResponse || (isEmail ? formData.identifier : null));
      
      // Use the detailed message from the backend if available
      const detailMessage = typeof errorData.detail === 'string' 
        ? errorData.detail 
        : '📧 Your account needs to be verified. We have sent a new verification link to your email address. Please check your inbox (and spam folder) and click the verification link to activate your account.';
      
      setErrors({ general: detailMessage });
      setSuccessMessage('A verification email has been sent. Please check your inbox.');
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
      const loginData = isEmail 
        ? { email: formData.identifier, password: formData.password }
        : { username: formData.identifier, password: formData.password };
      
      await login(loginData);
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
    <AuthContainer>
      <BannerContainer>
        <BannerImage src={loginBanner} alt="Login banner" />
      </BannerContainer>
      
      <FormContainer>
        <LogoContainer>
          <Logo src={blackLogo} alt="Twitter Clone Logo" />
        </LogoContainer>
        
        <FormTitle>Log in to Twitter Clone</FormTitle>
        
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="identifier">Username or Email</Label>
            <Input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your username or email"
            />
            {errors.identifier && <ErrorMessage>{errors.identifier}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>
          
          <ButtonContainer>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </ButtonContainer>
        </Form>

        <ButtonContainer style={{ marginTop: '16px' }}>
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
        </ButtonContainer>
        
        <LinkContainer>
          <LinkText>
            <Link to="/reset-password">Forgot password?</Link>
          </LinkText>
        </LinkContainer>
        
        <LinkContainer>
          <LinkText>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </LinkText>
        </LinkContainer>
      </FormContainer>
    </AuthContainer>
  );
};

export default LoginPage; 