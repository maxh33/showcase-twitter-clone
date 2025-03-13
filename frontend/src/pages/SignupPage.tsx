import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import { register } from '../services/authService';
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
  ErrorMessage
} from '../components/Auth/styles';
import signupBanner from '../assets/images/signupBanner.png';
import blackLogo from '../assets/icons/blackIcon.png';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password_confirmation
      });
      // Redirect to login page with a success message
      navigate('/login', { state: { message: 'Registration successful! Please check your email to verify your account.' } });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'data' in error.response) {
        setErrors(error.response.data as Record<string, string>);
      } else {
        setErrors({ general: 'An error occurred. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <BannerContainer>
        <BannerImage src={signupBanner} alt="Sign up banner" />
      </BannerContainer>
      
      <FormContainer>
        <LogoContainer>
          <Logo src={blackLogo} alt="Twitter Clone Logo" />
        </LogoContainer>
        
        <FormTitle>Create your account</FormTitle>
        
        {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
            {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
            {errors.password_confirmation && (
              <ErrorMessage>{errors.password_confirmation}</ErrorMessage>
            )}
          </FormGroup>
          
          <ButtonContainer>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </ButtonContainer>
        </Form>
        
        <LinkContainer>
          <LinkText>
            Already have an account? <Link to="/login">Log in</Link>
          </LinkText>
        </LinkContainer>
      </FormContainer>
    </AuthContainer>
  );
};

export default SignupPage; 