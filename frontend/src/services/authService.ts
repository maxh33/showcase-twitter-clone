import axios, { AxiosError } from 'axios';

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

// Track refresh token attempts to prevent infinite loops
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;
let refreshInProgress = false;
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 5000; // 5 seconds minimum between refresh attempts

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

interface ApiErrorResponse {
  [key: string]: string | string[];
}

// Helper function to sleep for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  message?: string;
}

export const register = async (data: RegisterData, retryCount = 0, maxRetries = 3): Promise<RegisterResponse> => {
  try {
    const response = await axios.post(`${API_URL}/v1/auth/register/`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429 && retryCount < maxRetries) {
      // If rate limited, wait progressively longer before retrying
      const waitTime = 1000 * Math.pow(2, retryCount); // exponential backoff: 1s, 2s, 4s...
      console.log(`Rate limited, retrying in ${waitTime/1000} seconds...`);
      await sleep(waitTime);
      // Retry with incremented retry count
      return register(data, retryCount + 1, maxRetries);
    }
    // For other errors or if max retries reached, throw the error
    throw error;
  }
};

export const login = async (data: LoginData) => {
  // Format the data to match backend expectations
  const loginData = {
    email: data.email || data.username, // Use email if provided, otherwise use username
    password: data.password
  };

  try {
    // Debug log with masked password
    const safeData = { ...loginData, password: '********' };
    console.log('Sending login data:', safeData);
    
    const response = await axios.post(`${API_URL}/v1/auth/login/`, loginData);
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      // Reset refresh attempts counter on successful login
      refreshAttempts = 0;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      // The server responded with a status code outside the 2xx range
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (typeof errorData === 'object') {
          // Check for specific error fields
          if (errorData.email) {
            throw new Error(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
          }
          if (errorData.password) {
            throw new Error(Array.isArray(errorData.password) ? errorData.password[0] : errorData.password);
          }
          if (errorData.error) {
            throw new Error(Array.isArray(errorData.error) ? errorData.error[0] : errorData.error);
          }
          // If no specific field error, get the first error message
          const firstError = Object.values(errorData)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }
      }
      throw new Error('Login failed. Please check your credentials and try again.');
    } else if (error instanceof Error) {
      throw new Error(error.message || 'An error occurred during login.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const silentLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isDemoUser');
  delete axios.defaults.headers.common['Authorization'];
  return { success: true };
};

export const logout = async (skipApiCall = false) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && !skipApiCall) {
      try {
        // Send refreshToken to be blacklisted
        await axios.post(`${API_URL}/v1/auth/logout/`, { refresh: refreshToken });
      } catch (apiError) {
        console.warn('Could not blacklist token on server, but will continue with local logout');
      }
    }
    // Always perform local logout
    return silentLogout();
  } catch (error) {
    // Still perform local logout even if there's an error
    silentLogout();
    throw error;
  }
};

export const refreshToken = async () => {
  // Check if we've exceeded max refresh attempts
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.warn(`Max refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached, forcing logout`);
    silentLogout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?session=expired';
    }
    throw new Error('Maximum refresh attempts exceeded');
  }

  // Prevent concurrent refresh calls
  if (refreshInProgress) {
    console.log('Token refresh already in progress');
    return new Promise((resolve, reject) => {
      const checkComplete = setInterval(() => {
        if (!refreshInProgress) {
          clearInterval(checkComplete);
          const token = localStorage.getItem('token');
          if (token) {
            resolve({ access: token });
          } else {
            reject(new Error('Refresh completed but no token available'));
          }
        }
      }, 100);
    });
  }

  // Apply rate limiting
  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime;
  if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
    const waitTime = MIN_REFRESH_INTERVAL - timeSinceLastRefresh;
    console.log(`Throttling token refresh, waiting ${waitTime}ms before next attempt`);
    await sleep(waitTime);
  }

  refreshInProgress = true;
  lastRefreshTime = Date.now();
  refreshAttempts++;

  try {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      refreshInProgress = false;
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${API_URL}/v1/auth/token/refresh/`, { refresh: refreshTokenValue });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      refreshInProgress = false;
      return response.data;
    }
    refreshInProgress = false;
    throw new Error('No access token in refresh response');
  } catch (error) {
    refreshInProgress = false;
    // If refresh fails, force silent logout (no API call) to prevent infinite loop
    silentLogout();
    throw error;
  }
};

export const verifyEmail = async (data: VerifyEmailData) => {
  const response = await axios.post(`${API_URL}/v1/auth/verify-email/`, data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await axios.post(`${API_URL}/v1/auth/password-reset/`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      // The server responded with a status code outside the 2xx range
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }
      }
      throw new Error('Password reset request failed. Please try again.');
    } else if (error instanceof Error) {
      // Something happened in setting up the request
      throw new Error(error.message || 'An error occurred. Please try again.');
    } else {
      // Fallback error
      throw new Error('An unexpected error occurred. Please try again.');
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

// Reset refresh attempts when page loads
if (typeof window !== 'undefined') {
  refreshAttempts = 0;
  setupAuthHeaders();
}

// Setup axios interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and not a login/refresh/logout request and hasn't been retried
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('login') &&
        !originalRequest.url?.includes('token/refresh') &&
        !originalRequest.url?.includes('logout')) {
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await refreshToken();
        
        // Update the authorization header
        originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.access}`;
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login (but don't call API logout)
        silentLogout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add demo login function
export const demoLogin = async () => {
  try {
    console.log('Attempting demo login...'); // Safe debug log (no credentials)
    
    const response = await axios.post(`${API_URL}/v1/auth/demo-login/`, {});
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('isDemoUser', 'true');
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      // Reset refresh attempts counter on successful login
      refreshAttempts = 0;
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }
      }
      throw new Error('Demo login failed. Please try again later.');
    } else if (error instanceof Error) {
      throw new Error(error.message || 'An error occurred during demo login.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

// Add function to check if current user is demo user
export const isDemoUser = () => {
  return localStorage.getItem('isDemoUser') === 'true';
};
