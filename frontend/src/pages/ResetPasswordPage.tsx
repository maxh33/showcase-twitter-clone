import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { resetPassword } from '../services/authService';
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
import signupBanner from '../assets/images/signupBanner.png';
import blackLogo from '../assets/icons/blackIcon.png';
import { AxiosError } from 'axios';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword({ email });
      setSuccess('Password reset instructions have been sent to your email address.');
      setEmail(''); // Clear the form
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.data && 'message' in axiosError.response.data) {
          setError(axiosError.response.data.message || 'Failed to send reset email');
        } else {
          setError('Failed to process your request. Please try again later.');
        }
      } else {
        setError('Failed to process your request. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <BannerContainer>
        <BannerImage src={signupBanner} alt="Reset Password" />
      </BannerContainer>
      
      <FormContainer>
        <LogoContainer>
          <Logo src={blackLogo} alt="Twitter Clone Logo" />
        </LogoContainer>
        
        <FormTitle>Reset Your Password</FormTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={!!success}
            />
          </FormGroup>
          
          <ButtonContainer>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading || !!success}
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </Button>
          </ButtonContainer>
        </Form>
        
        <LinkContainer>
          <LinkText>
            Remember your password? <Link to="/login">Log in</Link>
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

export default ResetPasswordPage; 