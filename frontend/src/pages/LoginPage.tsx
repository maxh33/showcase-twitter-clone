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

const LoginPage: React.FC = (): JSX.Element => {
  const [formData, setFormData] = useState({
    username: '',
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
  const { login, demoLogin } = useAuth();
  
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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
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
    setIsUnverified(false);
    setUnverifiedEmail(null);
    
    try {
      const response = await login({ username: formData.username, password: formData.password });
      
      if (response.requires_verification) {
        setIsUnverified(true);
        setUnverifiedEmail(response.email || null);
        setSuccessMessage('A verification link has been sent to your email address.');
      } else if (response.success) {
        navigate('/home');
      } else {
        setErrors({ general: response.error || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'An error occurred during login' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setIsResendingVerification(true);
    try {
      const response = await resendVerification(unverifiedEmail);
      if (response.success) {
        setSuccessMessage('A new verification link has been sent to your email address.');
      } else {
        setErrors({ general: response.error || 'Failed to resend verification email' });
      }
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to resend verification email' });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleDemoLogin = async (): Promise<void> => {
    setIsLoading(true);
    setErrors({});
    try {
      const result = await demoLogin();
      if (result.success) {
        navigate('/home');
      } else {
        setErrors({ general: result.error || 'Demo login failed' });
      }
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to login with demo account' });
    } finally {
      setIsLoading(false);
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
        
        {successMessage && (
          <S.SuccessMessage>{successMessage}</S.SuccessMessage>
        )}
        
        {errors.general && (
          <S.ErrorMessage>{errors.general}</S.ErrorMessage>
        )}
        
        <S.Form onSubmit={handleSubmit}>
          <S.FormGroup>
            <S.Label htmlFor="username">Username</S.Label>
            <S.Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <S.ErrorMessage>{errors.username}</S.ErrorMessage>
            )}
          </S.FormGroup>
          
          <S.FormGroup>
            <S.Label htmlFor="password">Password</S.Label>
            <S.Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <S.ErrorMessage>{errors.password}</S.ErrorMessage>
            )}
          </S.FormGroup>
          
          <S.ButtonContainer>
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
            
            {isUnverified && unverifiedEmail && (
              <div style={{ margin: '10px 0' }}>
                <Button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  variant="secondary"
                  fullWidth
                >
                  {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
            )}
            
            <div style={{ margin: '10px 0' }}>
              <Button
                onClick={handleDemoLogin}
                disabled={isLoading}
                variant="secondary"
                fullWidth
              >
                {isLoading ? 'Loading demo...' : 'Try Demo Account'}
              </Button>
            </div>
          </S.ButtonContainer>
        </S.Form>
        
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