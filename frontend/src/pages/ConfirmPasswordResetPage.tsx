import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { handlePasswordReset } from '../services/verificationService';
import * as S from '../components/Auth/styles';
import signupBanner from '../assets/images/signupBanner.png';
import blackLogo from '../assets/icons/blackIcon.png';
import { AxiosError } from 'axios';

const ConfirmPasswordResetPage: React.FC = () => {
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  
  useEffect(() => {
    if (!uid || !token) {
      setErrors({ general: 'Invalid reset link. Please request a new one.' });
    }
  }, [uid, token]);

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
    
    if (!uid || !token) {
      setErrors({ general: 'Invalid reset link. Please request a new one.' });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await handlePasswordReset({
        token,
        uidb64: uid,
        password: formData.password,
        password2: formData.password_confirmation
      });
      
      setSuccess('Password has been reset successfully!');
      
      // Reset form data
      setFormData({
        password: '',
        password_confirmation: ''
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password has been reset successfully. You can now log in with your new password.' } 
        });
      }, 3000);
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<Record<string, string>>;
        if (axiosError.response?.data) {
          setErrors(axiosError.response.data);
        } else {
          setErrors({ general: 'Failed to reset password. Please try again later.' });
        }
      } else {
        setErrors({ general: 'Failed to reset password. Please try again later.' });
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
        
        <S.FormTitle>Set New Password</S.FormTitle>
        
        {errors.general && <S.ErrorMessage>{errors.general}</S.ErrorMessage>}
        {success && <S.SuccessMessage>{success}</S.SuccessMessage>}
        
        {(!errors.general && uid && token) && !success && (
          <S.Form onSubmit={handleSubmit}>
            <S.FormGroup>
              <S.Label htmlFor="password">New Password</S.Label>
              <S.Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your new password"
              />
              {errors.password && <S.ErrorMessage>{errors.password}</S.ErrorMessage>}
            </S.FormGroup>
            
            <S.FormGroup>
              <S.Label htmlFor="password_confirmation">Confirm New Password</S.Label>
              <S.Input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm your new password"
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
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </S.ButtonContainer>
          </S.Form>
        )}
        
        <S.LinkContainer>
          <S.LinkText>
            Remember your password? <Link to="/login">Log in</Link>
          </S.LinkText>
        </S.LinkContainer>
      </S.FormContainer>
    </S.AuthContainer>
  );
};

export default ConfirmPasswordResetPage; 