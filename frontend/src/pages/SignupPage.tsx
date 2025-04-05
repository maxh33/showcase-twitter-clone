import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import { register } from '../services/authService';
import * as S from '../components/Auth/styles';
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
    } else {
      // Check username length
      if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters long';
      } else if (formData.username.length > 30) {
        newErrors.username = 'Username cannot exceed 30 characters';
      }
      
      // Check username format - only allow letters, numbers, periods, underscores, and hyphens
      const usernameRegex = /^[a-zA-Z0-9_. -]+$/;
      if (!usernameRegex.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, spaces, periods, underscores, and hyphens';
      }
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
    <S.AuthContainer>
      <S.BannerContainer>
        <S.BannerImage src={signupBanner} alt="Sign up banner" />
      </S.BannerContainer>
      
      <S.FormContainer>
        <S.LogoContainer>
          <S.Logo src={blackLogo} alt="Twitter Clone Logo" />
        </S.LogoContainer>
        
        <S.FormTitle>Create your account</S.FormTitle>
        
        {errors.general && <S.ErrorMessage>{errors.general}</S.ErrorMessage>}
        
        <S.Form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label htmlFor="username">Username</S.Label>
            <S.Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
            {errors.username && <S.ErrorMessage>{errors.username}</S.ErrorMessage>}
          </S.FormGroup>
          
          <S.FormGroup>
            <S.Label htmlFor="email">Email</S.Label>
            <S.Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
            {errors.email && <S.ErrorMessage>{errors.email}</S.ErrorMessage>}
          </S.FormGroup>
          
          <S.FormGroup>
            <S.Label htmlFor="password">Password</S.Label>
            <S.Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
            />
            {errors.password && <S.ErrorMessage>{errors.password}</S.ErrorMessage>}
          </S.FormGroup>
          
          <S.FormGroup>
            <S.Label htmlFor="password_confirmation">Confirm Password</S.Label>
            <S.Input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
            {errors.password_confirmation && (
              <S.ErrorMessage>{errors.password_confirmation}</S.ErrorMessage>
            )}
          </S.FormGroup>
          
          <S.ButtonContainer>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </S.ButtonContainer>
        </S.Form>
        
        <S.LinkContainer>
          <S.LinkText>
            Already have an account? <Link to="/login">Log in</Link>
          </S.LinkText>
        </S.LinkContainer>
      </S.FormContainer>
    </S.AuthContainer>
  );
};

export default SignupPage; 