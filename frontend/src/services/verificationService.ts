import { toast } from 'react-toastify';
import { apiV1 } from './authService';

interface VerifyEmailParams {
  uidb64: string;
  token: string;
}

interface ResetPasswordParams {
  token: string;
  uidb64: string;
  password: string;
  password2: string;
}

export const handleEmailVerification = async ({ uidb64, token }: VerifyEmailParams) => {
  try {
    await apiV1.post('/auth/verify-email/', {
      uidb64,
      token
    });
    
    return { success: true };
  } catch (error) {
    console.error('Email verification failed:', error);
    toast.error('Email verification failed. Please try again or contact support.');
    throw error;
  }
};

export const handlePasswordReset = async ({ token, uidb64, password, password2 }: ResetPasswordParams) => {
  try {
    await apiV1.post('/auth/password-reset/confirm/', {
      token,
      uidb64,
      password,
      password2
    });
    
    toast.success('Password has been reset successfully!');
    return { success: true };
  } catch (error) {
    console.error('Password reset failed:', error);
    toast.error('Password reset failed. Please try again or contact support.');
    throw error;
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    await apiV1.post('/auth/password-reset/', {
      email
    });
    
    toast.success('Password reset instructions have been sent to your email.');
    return { success: true };
  } catch (error) {
    console.error('Password reset request failed:', error);
    toast.error('Failed to send password reset email. Please try again.');
    throw error;
  }
}; 