import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  bio?: string;
  location?: string;
}

interface LoginData {
  email: string;
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

interface RefreshTokenData {
  refresh: string;
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
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Send refreshToken to be blacklisted
      await axios.post(`${API_URL}/auth/logout/`, { refresh: refreshToken });
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
    
    const response = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    }
    return response.data;
  } catch (error) {
    // If refresh fails, force logout
    logout();
    throw error;
  }
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
    const response = await axios.post(`${API_URL}/auth/password-reset/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const confirmResetPassword = async (data: ConfirmResetPasswordData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/password-reset/confirm/`, data);
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

// Setup axios interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and not a login request and hasn't been retried
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('login')) {
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        await refreshToken();
        
        // Update the authorization header
        const token = localStorage.getItem('token');
        if (token) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
