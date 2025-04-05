import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { handleEmailVerification } from '../services/verificationService';
import * as S from '../components/Auth/styles';
import logo from '../assets/icons/blackIcon.png';
import bannerFallback from '../assets/images/signupBanner.png';

const VerifyEmailPage: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerSrc, setBannerSrc] = useState("https://source.unsplash.com/random/?nature,water");

  const handleImageError = () => {
    console.log("Banner image failed to load, using fallback");
    setBannerSrc(bannerFallback);
  };

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!uid || !token) {
          throw new Error('Missing verification parameters');
        }
        
        await handleEmailVerification({
          uidb64: uid,
          token: token
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
        setIsVerifying(false);
      } catch (error) {
        console.error('Email verification failed:', error);
        setError('Email verification failed. Please try again or contact support.');
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [uid, token, navigate]);

  return (
    <S.AuthContainer>
      <S.BannerContainer>
        <S.BannerImage 
          src={bannerSrc} 
          alt="Banner" 
          onError={handleImageError}
        />
      </S.BannerContainer>
      <S.FormContainer>
        <S.LogoContainer>
          <S.Logo src={logo} alt="Logo" />
        </S.LogoContainer>
        <S.FormTitle>Email Verification</S.FormTitle>
        
        {isVerifying ? (
          <S.InfoMessage>
            Verifying your email address...
          </S.InfoMessage>
        ) : error ? (
          <S.ErrorMessage>
            {error}
          </S.ErrorMessage>
        ) : (
          <S.SuccessMessage>
            Email verified successfully! Redirecting to login...
          </S.SuccessMessage>
        )}
        
        <S.LinkContainer>
          <S.LinkText>
            Return to{' '}
            <S.StyledLink onClick={() => navigate('/login')}>
              Login
            </S.StyledLink>
          </S.LinkText>
        </S.LinkContainer>
      </S.FormContainer>
    </S.AuthContainer>
  );
};

export default VerifyEmailPage; 