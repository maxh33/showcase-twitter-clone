import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface VerifyEmailData {
  token: string;
}

interface ResetPasswordData {
  email: string;
}

interface ConfirmResetPasswordData {
  token: string;
  password: string;
  password_confirmation: string;
}

export const register = async (data: RegisterData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (data: LoginData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

export const verifyEmail = async (data: VerifyEmailData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-email/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const confirmResetPassword = async (data: ConfirmResetPasswordData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/confirm-reset-password/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const setupAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
