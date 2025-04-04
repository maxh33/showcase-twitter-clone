import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { requestPasswordReset } from '../services/verificationService';
import * as S from '../components/Auth/styles';
import signupBanner from '../assets/images/signupBanner.png';
import blackLogo from '../assets/icons/blackIcon.png';
import { AxiosError } from 'axios';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
    setInfo(null);
    setSuccess(null);
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
    setError(null);
    setSuccess(null);
    setInfo(null);
    setRequiresVerification(false);
    
    try {
      await requestPasswordReset(email);
      setSuccess('Check your email for reset instructions, including spam folder.');
      setEmail(''); // Clear the form
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<any>;
        if (axiosError.response?.status === 403 && axiosError.response.data?.requires_verification) {
          setInfo(axiosError.response.data.message || 'Your account needs to be verified. Please check your email for verification instructions.');
          setRequiresVerification(true);
        } else if (axiosError.response?.data && 'message' in axiosError.response.data) {
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
    <S.AuthContainer>
      <S.BannerContainer>
        <S.BannerImage src={signupBanner} alt="Reset Password" />
      </S.BannerContainer>
      
      <S.FormContainer>
        <S.LogoContainer>
          <S.Logo src={blackLogo} alt="Twitter Clone Logo" />
        </S.LogoContainer>
        
        <S.FormTitle>Reset Your Password</S.FormTitle>
        
        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
        {success && <S.SuccessMessage>{success}</S.SuccessMessage>}
        {info && <S.InfoMessage>{info}</S.InfoMessage>}
        
        <S.Form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label htmlFor="email">Email</S.Label>
            <S.Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={!!success}
            />
          </S.FormGroup>
          
          <S.ButtonContainer>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading || !!success}
            >
              {isLoading ? 'Sending...' : requiresVerification ? 'Resend Verification Email' : 'Reset Password'}
            </Button>
          </S.ButtonContainer>
        </S.Form>
        
        <S.LinkContainer>
          <S.LinkText>
            Remember your password? <Link to="/login">Log in</Link>
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

export default ResetPasswordPage; 