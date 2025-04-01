import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { login, demoLogin } from '../services/authService';
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

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    identifier: '', // This can be either username or email
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Determine if identifier is an email or username
      const isEmail = formData.identifier.includes('@');
      const loginData = isEmail 
        ? { email: formData.identifier, password: formData.password }
        : { username: formData.identifier, password: formData.password };
      
      await login(loginData);
      navigate('/'); // Redirect to home page after successful login
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        const responseData = error.response.data;
        
        if (responseData && typeof responseData === 'object') {
          // Type assertion to allow property access
          const errorData = responseData as Record<string, unknown>;
          
          // Check for specific error fields
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
        } else {
          setErrors({ general: 'Invalid credentials. Please try again.' });
        }
      } else {
        setErrors({ general: 'Unable to log in. Please check your credentials and try again.' });
      }
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
      
      if (error && typeof error === 'object' && 'message' in error) {
        setErrors({ general: String(error.message) });
      } else {
        setErrors({ general: 'An error occurred during demo login. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
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