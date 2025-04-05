import axios from 'axios';
import { User } from '../types/user';

// Get the API URL from localStorage for consistency with authService
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('debug-api-url') || 
           (window.location.hostname === 'localhost' ? 'http://localhost:8000/api/v1' : 'https://maxh33.pythonanywhere.com/api');
  }
  return 'https://maxh33.pythonanywhere.com/api';
};

export const demoLogin = async (): Promise<User> => {
  try {
    // Call the backend demo login endpoint
    const apiUrl = getApiUrl();
    const response = await axios.post(`${apiUrl}/v1/auth/demo-login/`);
    
    // Set auth headers with the received token
    if (response.data.access) {
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
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/v1/auth/check-demo/`);
    return response.data.is_demo_user;
  } catch (error) {
    return false;
  }
};

const demoAuthService = {
  demoLogin,
  isDemoUser,
};

export default demoAuthService; 