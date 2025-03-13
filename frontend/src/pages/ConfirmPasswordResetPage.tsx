import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Button from '../components/Button';
import { confirmResetPassword } from '../services/authService';
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

const ConfirmPasswordResetPage: React.FC = () => {
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Get token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (!tokenParam) {
      setErrors({ general: 'Invalid reset link. Please request a new one.' });
    } else {
      setToken(tokenParam);
    }
  }, [location.search]);

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
    
    if (!token) {
      setErrors({ general: 'Invalid reset link. Please request a new one.' });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await confirmResetPassword({
        token,
        password: formData.password,
        uidb64: '',
        password2: ''
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
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const responseObj = error.response as any;
        if (responseObj && typeof responseObj === 'object' && 'data' in responseObj) {
          setErrors(responseObj.data as Record<string, string>);
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
    <AuthContainer>
      <BannerContainer>
        <BannerImage src={signupBanner} alt="Reset Password" />
      </BannerContainer>
      
      <FormContainer>
        <LogoContainer>
          <Logo src={blackLogo} alt="Twitter Clone Logo" />
        </LogoContainer>
        
        <FormTitle>Set New Password</FormTitle>
        
        {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        {!errors.general && !success && (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="password">New Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your new password"
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password_confirmation">Confirm New Password</Label>
              <Input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm your new password"
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
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </ButtonContainer>
          </Form>
        )}
        
        <LinkContainer>
          <LinkText>
            Remember your password? <Link to="/login">Log in</Link>
          </LinkText>
        </LinkContainer>
      </FormContainer>
    </AuthContainer>
  );
};

export default ConfirmPasswordResetPage; 