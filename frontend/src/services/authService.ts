import axios, { AxiosError } from 'axios';
import { LoginResponse, RegisterData, RegisterResponse, AuthResponse } from '../types/auth';
import { User } from '../types/user';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create an axios instance with the base URL
export const apiV1 = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get error message from axios error
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; error?: string }>;
    return axiosError.response?.data?.detail || axiosError.response?.data?.error || 'An error occurred';
  }
  return 'An error occurred';
};

// Helper function to build API URL
export const buildUrl = (endpoint: string): string => `/api/v1/${endpoint}`;

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiV1.post('/auth/login/', {
      username,
      email: username.includes('@') ? username : `${username}@example.com`,
      password,
    });

    if (response.data.requires_verification) {
      return {
        success: false,
        message: response.data.message || 'Account not verified',
        requires_verification: true,
        email: response.data.email
      };
    }

    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      setupAuthHeaders();
    }

    return { success: true, message: 'Login successful', data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.requires_verification) {
      return {
        success: false,
        message: error.response.data.message || 'Account not verified',
        requires_verification: true,
        email: error.response.data.email
      };
    }
    return { success: false, message: getErrorMessage(error) };
  }
};

export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    await apiV1.post('/auth/register/', userData);
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};

export const resendVerification = async (email: string): Promise<AuthResponse> => {
  try {
    await apiV1.post('/auth/resend-verification/', { email });
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};

export const logout = () => {
  localStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

export const setupAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    apiV1.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const demoLogin = async (): Promise<LoginResponse> => {
  try {
    // Generate a unique session ID using timestamp and random string
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sessionId = `${timestamp}_${randomString}`;

    const response = await apiV1.post('/auth/demo-login/', { session_id: sessionId });

    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      setupAuthHeaders();
    }

    return { success: true, message: 'Demo login successful', data: response.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Setup axios interceptor to handle unauthorized responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
