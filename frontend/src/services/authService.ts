import axios from 'axios';

// Store the original API URL from environment for debugging
const ORIGINAL_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Try to detect if we're in a deployed environment and use PythonAnywhere API
// The hostname check helps detect when running on Vercel
const isDeployed = typeof window !== 'undefined' && 
                  window.location.hostname !== 'localhost' && 
                  window.location.hostname !== '127.0.0.1';

// If deployed and still using localhost, force to PythonAnywhere
const API_URL = isDeployed && ORIGINAL_API_URL.includes('localhost') 
  ? 'https://maxh33.pythonanywhere.com/api' 
  : ORIGINAL_API_URL;

// Store the API URL in localStorage for debugging
if (typeof window !== 'undefined') {
  localStorage.setItem('debug-api-url', API_URL);
  console.log('Using API URL:', API_URL);
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  bio?: string;
  location?: string;
}

interface LoginData {
  username?: string;
  email?: string;
  password: string;
}

interface VerifyEmailData {
  token: string;
  uidb64: string;
}

interface ResetPasswordData {
  email: string;
}

interface ConfirmResetPasswordData {
  token: string;
  uidb64: string;
  password: string;
  password2: string;
}

export const register = async (data: RegisterData) => {
  const response = await axios.post(`${API_URL}/v1/auth/register/`, data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await axios.post(`${API_URL}/api/v1/auth/login/`, data);
  if (response.data.access) {
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
  }
  return response.data;
};

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Send refreshToken to be blacklisted
      await axios.post(`${API_URL}/v1/auth/logout/`, { refresh: refreshToken });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    return { success: true };
  } catch (error) {
    // Still remove tokens on frontend even if backend call fails
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${API_URL}/v1/auth/token/refresh/`, { refresh: refreshToken });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      return response.data;
    }
    throw new Error('No access token in refresh response');
  } catch (error) {
    // If refresh fails, force logout
    await logout();
    throw error;
  }
};

export const verifyEmail = async (data: VerifyEmailData) => {
  const response = await axios.post(`${API_URL}/v1/auth/verify-email/`, data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/password-reset/`, data);
    return response.data;
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      if (error.response.data && typeof error.response.data === 'object') {
        throw new Error(Object.values(error.response.data)[0] as string);
      }
      throw new Error('Password reset request failed. Please try again.');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request
      throw new Error('An error occurred. Please try again.');
    }
  }
};

export const confirmResetPassword = async (data: ConfirmResetPasswordData) => {
  const response = await axios.post(`${API_URL}/v1/auth/password-reset/confirm/`, data);
  return response.data;
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

// Setup axios interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and not a login/refresh request and hasn't been retried
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('login') &&
        !originalRequest.url?.includes('token/refresh')) {
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await refreshToken();
        
        // Update the authorization header
        originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.access}`;
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        await logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
