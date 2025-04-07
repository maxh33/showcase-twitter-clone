import axios, { AxiosError } from 'axios';

// Store the original API URL from environment for debugging
const ORIGINAL_API_URL = process.env.REACT_APP_API_URL || 'http://backend:8000/api';

// Log the original environment value for debugging
console.log('Original API URL from environment:', ORIGINAL_API_URL);

// Try to detect if we're in a deployed environment and use PythonAnywhere API
// The hostname check helps detect when running on Vercel
const isDeployed = typeof window !== 'undefined' && 
                  window.location.hostname !== 'localhost' && 
                  window.location.hostname !== '127.0.0.1';

console.log('Is deployed environment:', isDeployed);

// Check if the API URL is a development URL (localhost or Docker backend)
const isDevApiUrl = ORIGINAL_API_URL.includes('localhost') || 
                   ORIGINAL_API_URL.includes('backend:') ||
                   ORIGINAL_API_URL.includes('127.0.0.1');

console.log('Is development API URL:', isDevApiUrl);

// If deployed and using a development API URL, force to PythonAnywhere with HTTPS
const API_URL = isDeployed && isDevApiUrl 
  ? 'https://maxh33.pythonanywhere.com/api/v1' 
  : ORIGINAL_API_URL;

// Always use HTTPS for production PythonAnywhere URLs
const FINAL_API_URL = API_URL.includes('pythonanywhere.com') && !API_URL.startsWith('https://') 
  ? API_URL.replace('http://', 'https://') 
  : API_URL;

console.log('Final API URL to use:', FINAL_API_URL);

// Store the API URL in localStorage for debugging
if (typeof window !== 'undefined') {
  localStorage.setItem('debug-api-url', FINAL_API_URL);
  localStorage.setItem('api-url-determination', JSON.stringify({
    original: ORIGINAL_API_URL,
    isDeployed,
    isDevApiUrl,
    finalUrl: FINAL_API_URL,
    time: new Date().toISOString()
  }));
}

// Configure axios defaults
axios.defaults.baseURL = FINAL_API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Remove CORS headers - these should only be set by the server, not the client
// Keep track of refresh token attempts to prevent infinite loops
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

interface ResendVerificationData {
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

interface AuthTokens {
  access: string;
  refresh: string;
  user?: Record<string, unknown>;
}

// Helper function to build complete API URLs
export const buildUrl = (endpoint: string): string => {
  try {
    // Remove leading slash and v1 from endpoint if present
    const cleanEndpoint = endpoint.replace(/^\/?(v1\/)?/, '');
    
    // Always ensure we have a valid API URL
    let baseUrl = '';
    if (axios.defaults.baseURL) {
      baseUrl = axios.defaults.baseURL.toString();
    } else {
      baseUrl = FINAL_API_URL;
    }
    
    console.log(`Building URL from base: ${baseUrl} and endpoint: ${cleanEndpoint}`);
    
    // If baseUrl already has /v1, don't add it again
    if (baseUrl.includes('/v1')) {
      return `${baseUrl}/${cleanEndpoint}`;
    } else {
      return `${baseUrl}/v1/${cleanEndpoint}`;
    }
  } catch (error) {
    console.error('Error building URL:', error);
    return `${FINAL_API_URL}/v1/${endpoint.replace(/^\/?(v1\/)?/, '')}`;
  }
};

export const register = async (data: RegisterData, retryCount = 0, maxRetries = 3): Promise<RegisterResponse> => {
  try {
    console.log('Attempting registration with data:', { ...data, password: '********', password2: '********' }); // Debug log
    const response = await axios.post(buildUrl('auth/register/'), data);
    console.log('Registration response:', response.data); // Debug log
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
    console.error('Registration error:', error); // Debug log
    throw error;
  }
};

// Helper function to format login data
const formatLoginData = (data: LoginData) => {
  return {
    email: data.email || data.username, // Use email if provided, otherwise use username
    username: data.email || data.username, // Include username field with same value for compatibility
    password: data.password
  };
};

// Define a more specific type for error data
interface ErrorData {
  [key: string]: unknown;
  requires_verification?: boolean;
  detail?: string;
}

// Helper function to handle login error responses
const extractVerificationError = (errorData: ErrorData): string | null => {
  if ('requires_verification' in errorData && errorData.requires_verification) {
    return typeof errorData.detail === 'string'
      ? errorData.detail
      : 'Your account has not been verified. Please check your email for the verification link.';
  }
  return null;
};

const extractFieldError = (errorData: ErrorData, field: string): string | null => {
  if (errorData[field]) {
    const fieldError = errorData[field];
    return Array.isArray(fieldError) ? fieldError[0] : String(fieldError);
  }
  return null;
};

const extractFirstError = (errorData: ErrorData): string => {
  const firstErrorField = Object.keys(errorData)[0];
  const firstError = errorData[firstErrorField];
  return Array.isArray(firstError) ? firstError[0] : String(firstError);
};

// Helper function to handle login error responses
const handleLoginError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    // The server responded with a status code outside the 2xx range
    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      if (typeof errorData === 'object') {
        // Check for account verification errors (status 403)
        const verificationError = extractVerificationError(errorData as ErrorData);
        if (verificationError) {
          throw new Error(verificationError);
        }
        
        // Check for specific error fields
        const emailError = extractFieldError(errorData, 'email');
        if (emailError) throw new Error(emailError);
        
        const passwordError = extractFieldError(errorData, 'password');
        if (passwordError) throw new Error(passwordError);
        
        const generalError = extractFieldError(errorData, 'error');
        if (generalError) throw new Error(generalError);
        
        // If no specific field error, get the first error message
        throw new Error(extractFirstError(errorData as ErrorData));
      }
    }
    throw new Error('Login failed. Please check your credentials and try again.');
  } else if (error instanceof Error) {
    throw new Error(error.message || 'An error occurred during login.');
  } else {
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const storeAuthTokens = (data: AuthTokens) => {
  if (data.access) {
    localStorage.setItem('token', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
    // Reset refresh attempts counter on successful login
    refreshAttempts = 0;
  }
  return data;
};

// Create a more specific type for login response
interface LoginResponse {
  success: boolean;
  data?: {
    id: number | string;
    username: string;
    email: string;
    is_demo_user?: boolean;
    [key: string]: unknown;
  };
  error?: string;
  user?: Record<string, unknown>;
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const { username, email, password } = formatLoginData(data);
    
    // Special handling for demo users
    if (username === 'demo' || username === 'demo@twitterclone.com') {
      try {
        // Try to use the special demo endpoint
        const response = await axios.post(buildUrl('auth/demo-login/'), {});
        const { refresh, access, user } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, data: user };
      } catch (error) {
        console.log('Demo login API failed, using client-side fallback');
        // Fallback to client-side demo user if backend is unavailable
        const demoUser = {
          id: 999,
          username: 'demo',
          email: 'demo@twitterclone.com',
          is_demo_user: true
        };
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        return { success: true, data: demoUser };
      }
    }
    
    // Normal login flow for non-demo users
    const response = await axios.post(buildUrl('auth/login/'), { username, password });
    const { refresh, access, user } = response.data;
    
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, data: user };
  } catch (error: unknown) {
    console.error('Login error:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      // Server responded with an error
      const errorMessage = error.response.data.detail || 'Invalid credentials';
      return { success: false, error: errorMessage };
    } else if (axios.isAxiosError(error) && error.request) {
      // Request made but no response
      return { success: false, error: 'Server error. Please try again later.' };
    } else {
      // Something else caused the error
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }
};

export const silentLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isDemoUser');
  localStorage.removeItem('demoCredentials');
  delete axios.defaults.headers.common['Authorization'];
  return { success: true };
};

export const logout = async (skipApiCall = false) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && !skipApiCall) {
      try {
        // Send refreshToken to be blacklisted
        await axios.post(buildUrl('auth/logout/'), { refresh: refreshToken });
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

// Define an interface for token refresh response
interface TokenRefreshResponse {
  access: string;
  refresh?: string;
  [key: string]: unknown;
}

// Handle waiting for existing refresh to complete
const waitForPendingRefresh = (): Promise<TokenRefreshResponse> => {
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
};

// Check if refresh token needs to be throttled
const shouldThrottleRefresh = async (lastRefreshTime: number): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime;
  
  if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
    const waitTime = MIN_REFRESH_INTERVAL - timeSinceLastRefresh;
    console.log(`Throttling token refresh, waiting ${waitTime}ms before next attempt`);
    await sleep(waitTime);
  }
};

// Handle refresh token request
const performTokenRefresh = async (refreshTokenValue: string): Promise<TokenRefreshResponse> => {
  try {
    const response = await axios.post(buildUrl('auth/token/refresh/'), { refresh: refreshTokenValue });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      return response.data;
    }
    throw new Error('No access token in refresh response');
  } catch (error) {
    // If refresh fails, force silent logout (no API call) to prevent infinite loop
    silentLogout();
    throw error;
  }
};

// Check if max refresh attempts exceeded
const checkMaxRefreshAttempts = (): boolean => {
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.warn(`Max refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached, forcing logout`);
    silentLogout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?session=expired';
    }
    return true;
  }
  return false;
};

// Simple function to get refresh token value
const getRefreshTokenValue = (): string => {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }
  return refreshTokenValue;
};

/**
 * Attempts to refresh the authentication token
 * Core function delegating to helpers to keep complexity low
 */
export const refreshToken = async (): Promise<TokenRefreshResponse> => {
  // Check if we've exceeded max refresh attempts
  if (checkMaxRefreshAttempts()) {
    throw new Error('Maximum refresh attempts exceeded');
  }

  // Prevent concurrent refresh calls
  if (refreshInProgress) {
    return waitForPendingRefresh();
  }

  try {
    // Apply rate limiting
    await shouldThrottleRefresh(lastRefreshTime);
    
    // Set flags and counters
    refreshInProgress = true;
    lastRefreshTime = Date.now();
    refreshAttempts++;
    
    // Get token and perform refresh
    const token = getRefreshTokenValue();
    const result = await performTokenRefresh(token);
    
    return result;
  } catch (error) {
    // Log the error but still propagate it
    console.error('Token refresh failed:', error);
    throw error;
  } finally {
    refreshInProgress = false;
  }
};

export const verifyEmail = async (data: VerifyEmailData) => {
  try {
    const response = await axios.post(buildUrl('auth/verify-email/'), data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'Email verification failed';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// Helper function to handle reset password error responses
const handleResetPasswordError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      if (typeof errorData === 'object') {
        // Check for specific error fields
        if (errorData.email) {
          throw new Error(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
        }
        if (errorData.error) {
          throw new Error(Array.isArray(errorData.error) ? errorData.error[0] : errorData.error);
        }
        // If no specific field error, get the first error message
        const firstError = Object.values(errorData)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
      }
    }
    throw new Error('Password reset request failed. Please try again.');
  } else if (error instanceof Error) {
    throw new Error(error.message || 'An error occurred while requesting password reset.');
  } else {
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await axios.post(buildUrl('auth/reset-password/'), data);
    return response.data;
  } catch (error) {
    return handleResetPasswordError(error);
  }
};

// Helper function to handle verification email error responses
const handleVerificationEmailError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      if (typeof errorData === 'object') {
        // Check for specific error fields
        if (errorData.email) {
          throw new Error(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
        }
        if (errorData.error) {
          throw new Error(Array.isArray(errorData.error) ? errorData.error[0] : errorData.error);
        }
        // If no specific field error, get the first error message
        const firstError = Object.values(errorData)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
      }
    }
    throw new Error('Failed to resend verification email. Please try again.');
  } else if (error instanceof Error) {
    throw new Error(error.message || 'An error occurred while resending verification email.');
  } else {
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const resendVerification = async (data: ResendVerificationData) => {
  try {
    const response = await axios.post(buildUrl('auth/resend-verification/'), data);
    return response.data;
  } catch (error) {
    return handleVerificationEmailError(error);
  }
};

// Helper function to handle token refresh in interceptor
const handleTokenRefresh = async (originalRequest: {
  _retry: boolean;
  headers: Record<string, string>;
  [key: string]: unknown;
}) => {
  originalRequest._retry = true;
  
  try {
    // Try to refresh the token
    const refreshResponse = await refreshToken() as TokenRefreshResponse;
    
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
};

// Helper function to check if request needs token refresh
const shouldAttemptTokenRefresh = (error: {
  response?: { status?: number };
  config: { _retry?: boolean; url?: string };
}) => {
  const originalRequest = error.config;
  return error.response?.status === 401 && 
         !originalRequest._retry && 
         !originalRequest.url?.includes('login') &&
         !originalRequest.url?.includes('token/refresh') &&
         !originalRequest.url?.includes('logout');
};

// Helper function to handle password reset confirmation errors for specific fields
const handleSpecificPasswordResetError = (errorData: Record<string, unknown>): never => {
  // Check for specific error fields in order of priority
  const errorFields = ['password', 'password2', 'token', 'uidb64', 'error'];
  
  for (const field of errorFields) {
    if (errorData[field]) {
      const fieldError = errorData[field];
      throw new Error(Array.isArray(fieldError) ? fieldError[0] : String(fieldError));
    }
  }
  
  // If no specific field error, get the first error message
  const firstError = Object.values(errorData)[0];
  throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
};

// Helper function to handle password reset confirmation errors
const handleConfirmResetPasswordError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      if (typeof errorData === 'object') {
        return handleSpecificPasswordResetError(errorData as Record<string, unknown>);
      }
    }
    throw new Error('Password reset confirmation failed. Please try again.');
  } else if (error instanceof Error) {
    throw new Error(error.message || 'An error occurred while confirming password reset.');
  } else {
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const confirmResetPassword = async (data: ConfirmResetPasswordData) => {
  try {
    const response = await axios.post(buildUrl('auth/password-reset/confirm/'), data);
    return response.data;
  } catch (error) {
    return handleConfirmResetPasswordError(error);
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
    if (shouldAttemptTokenRefresh(error)) {
      return handleTokenRefresh(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Handle demo login errors
const handleDemoLoginError = (error: unknown): never => {
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
};

// Helper function to handle successful login
const handleSuccessfulLogin = (response: { data: AuthTokens }) => {
  if (response?.data?.access) {
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    localStorage.setItem('isDemoUser', 'true');
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    // Reset refresh attempts counter on successful login
    refreshAttempts = 0;
  }
  return response.data;
};

// Helper function to attempt login with specific credentials
const attemptLogin = async (credentials: { email: string, username: string, password: string }) => {
  console.log(`Attempting login with username: ${credentials.username}`);
  const response = await axios.post(buildUrl('auth/login/'), credentials);
  return handleSuccessfulLogin(response);
};

// Add demo login function
export const demoLogin = async () => {
  try {
    console.log('Attempting demo login...'); // Safe debug log (no credentials)
    
    // Try with direct login using standard demo credentials
    try {
      console.log('Using standard demo credentials');
      
      return await attemptLogin({
        email: 'demo@twitterclone.com',
        username: 'demo_user',
        password: 'Demo@123'
      });
    } catch (loginError) {
      console.error('Standard demo credentials failed, trying with timestamp', loginError);
      
      // Fallback to using a timestamp-based credential as a last resort
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);
      return await attemptLogin({
        email: `demo+${timestamp}@twitterclone.com`,
        username: `demo_user_${timestamp}`,
        password: 'Demo@123'
      });
    }
  } catch (error) {
    return handleDemoLoginError(error);
  }
};

// Add function to check if current user is demo user
export const isDemoUser = () => {
  return localStorage.getItem('isDemoUser') === 'true';
};
