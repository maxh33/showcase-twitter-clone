import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail } from '../services/authService';
import {
  AuthContainer,
  BannerContainer,
  BannerImage,
  FormContainer,
  LogoContainer,
  Logo,
  FormTitle,
  ButtonContainer,
  LinkContainer,
  LinkText,
  ErrorMessage,
  SuccessMessage
} from '../components/Auth/styles';
import Button from '../components/Button';
import signupBanner from '../assets/images/signupBanner.png';
import blackLogo from '../assets/icons/blackIcon.png';

const VerifyEmailPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyUserEmail = async () => {
      // Get token from URL query parameters
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      if (!token) {
        setError('Invalid verification link. Please request a new one.');
        setIsLoading(false);
        return;
      }

      try {
        await verifyEmail({ token, uidb64: '' });
        setSuccess('Email verified successfully! You can now login to your account.');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const responseObj = error.response as any;
          if (responseObj && typeof responseObj === 'object' && 'data' in responseObj && 
              responseObj.data && typeof responseObj.data === 'object' && 'message' in responseObj.data) {
            setError(responseObj.data.message as string);
          } else {
            setError('Failed to verify email. Please try again or contact support.');
          }
        } else {
          setError('Failed to verify email. Please try again or contact support.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserEmail();
  }, [location.search]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <AuthContainer>
      <BannerContainer>
        <BannerImage src={signupBanner} alt="Email Verification" />
      </BannerContainer>
      
      <FormContainer>
        <LogoContainer>
          <Logo src={blackLogo} alt="Twitter Clone Logo" />
        </LogoContainer>
        
        <FormTitle>Email Verification</FormTitle>
        
        {isLoading ? (
          <p>Verifying your email...</p>
        ) : (
          <>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            
            <ButtonContainer>
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleGoToLogin}
              >
                Go to Login
              </Button>
            </ButtonContainer>
            
            <LinkContainer>
              <LinkText>
                Having trouble? Contact our support team.
              </LinkText>
            </LinkContainer>
          </>
        )}
      </FormContainer>
    </AuthContainer>
  );
};

export default VerifyEmailPage; 