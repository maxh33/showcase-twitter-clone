import axios from 'axios';
import { User } from '../types/user';

export const demoLogin = async (): Promise<User> => {
  try {
    // Call the backend demo login endpoint
    const response = await axios.post('/auth/demo-login/');
    
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
    const response = await axios.get('/auth/check-demo/');
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