import axios from 'axios';
import { User } from '../types/user';

// Get the API URL from localStorage or default sources
const getApiUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const storedApiUrl = localStorage.getItem('debug-api-url');
    // If a valid URL is stored, use it
    if (storedApiUrl) return storedApiUrl;
    
    // Default URL based on environment
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api' 
      : 'https://maxh33.pythonanywhere.com/api';
  }
  // Fallback for non-browser environments
  return 'https://maxh33.pythonanywhere.com/api';
};

// Build complete API URL for a given endpoint
const buildUrl = (endpoint: string): string => {
  const apiUrl = getApiUrl();
  
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Check if the endpoint already includes v1/
  if (cleanEndpoint.startsWith('v1/')) {
    return `${apiUrl}/${cleanEndpoint}`;
  }
  
  // Otherwise add v1/ prefix
  return `${apiUrl}/v1/${cleanEndpoint}`;
};

export const demoLogin = async (): Promise<User> => {
  try {
    // Call the backend demo login endpoint
    const response = await axios.post(buildUrl('auth/demo-login/'));
    
    // Set auth headers with the received token
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('isDemoUser', 'true');
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    }
    
    return response.data.user;
  } catch (error) {
    console.error('Error during demo login:', error);
    throw error;
  }
};

export const isDemoUser = async (): Promise<boolean> => {
  try {
    const response = await axios.get(buildUrl('auth/check-demo/'));
    return response.data.is_demo_user;
  } catch (error) {
    // If the endpoint doesn't exist, check localStorage
    const tokenExists = !!localStorage.getItem('token');
    const isDemoFromStorage = localStorage.getItem('isDemoUser') === 'true';
    return tokenExists && isDemoFromStorage;
  }
};

const demoAuthService = {
  demoLogin,
  isDemoUser,
};

export default demoAuthService; 