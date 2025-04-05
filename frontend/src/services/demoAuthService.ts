import axios from 'axios';
import { User } from '../types/user';

// Get the API URL from localStorage or default sources
const getApiUrl = () => {
  console.log('Getting API URL for demo service...');
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check for explicitly configured API URL in localStorage (for debugging)
    const storedApiUrl = localStorage.getItem('debug-api-url');
    if (storedApiUrl) {
      console.log('Using stored API URL from localStorage:', storedApiUrl);
      return storedApiUrl;
    }
    
    // Use hostname detection for environment-specific URLs
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('Using localhost API URL');
      return 'http://localhost:8000/api';
    } else {
      // For production deployments
      console.log('Using production API URL');
      return 'https://maxh33.pythonanywhere.com/api';
    }
  }
  
  // Fallback for non-browser environments
  console.log('Fallback to production API URL');
  return 'https://maxh33.pythonanywhere.com/api';
};

// Build complete API URL for a given endpoint with improved error handling
const buildUrl = (endpoint: string): string => {
  try {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const apiUrl = getApiUrl();
    
    // Check if the API URL already contains the v1 part
    const hasV1InApiUrl = apiUrl.includes('/v1');
    
    // Construct full URL with version prefix
    let fullUrl: string;
    
    // If the endpoint already includes v1/ prefix, don't add it again
    if (cleanEndpoint.startsWith('v1/')) {
      // If API URL already has v1, remove the v1 from the endpoint to avoid duplicates
      const endpointWithoutV1 = cleanEndpoint.replace('v1/', '');
      fullUrl = hasV1InApiUrl ? `${apiUrl}/${endpointWithoutV1}` : `${apiUrl}/${cleanEndpoint}`;
    } else {
      // If API URL already has v1, don't add it again
      fullUrl = hasV1InApiUrl ? `${apiUrl}/${cleanEndpoint}` : `${apiUrl}/v1/${cleanEndpoint}`;
    }
    
    console.log('Built URL:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Error building URL:', error);
    // Fallback to a direct URL if there's an error
    return `https://maxh33.pythonanywhere.com/api/v1/${endpoint}`;
  }
};

// Improved demo login with detailed logging and fallbacks
export const demoLogin = async (): Promise<User> => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').substring(0, 15);
  console.log(`[${timestamp}] Starting demo login process...`);
  
  try {
    // Try demo-login endpoint first
    console.log(`[${timestamp}] Attempting to call demo-login endpoint...`);
    const demoLoginUrl = buildUrl('auth/demo-login/');
    
    try {
      const response = await axios.post(demoLoginUrl, {
        // Add timestamp to request for better uniqueness
        timestamp: timestamp
      });
      console.log(`[${timestamp}] Demo login successful via demo-login endpoint`);
      
      // Set auth headers with the received token
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('isDemoUser', 'true');
        localStorage.setItem('demoTimestamp', timestamp);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }
      
      return response.data.user;
    } catch (demoEndpointError) {
      console.error(`[${timestamp}] Demo-login endpoint failed:`, demoEndpointError);
      
      // Fallback to regular login with default demo credentials
      console.log(`[${timestamp}] Falling back to regular login with demo user credentials...`);
      const loginUrl = buildUrl('auth/login/');
      
      // Use a timestamp-based unique email if possible to avoid conflicts
      const response = await axios.post(loginUrl, {
        email: `demo+${timestamp}@twitterclone.com`,
        username: `demo_user_${timestamp}`,
        password: 'Demo@123'
      });
      
      console.log(`[${timestamp}] Demo login successful via regular login endpoint`);
      
      // Set auth headers with the received token
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('isDemoUser', 'true');
        localStorage.setItem('demoTimestamp', timestamp);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }
      
      // Create basic user object if not provided in response
      if (!response.data.user) {
        console.log(`[${timestamp}] Creating fallback user object from login response`);
        return {
          id: '0',
          username: `demo_user_${timestamp}`,
          email: `demo+${timestamp}@twitterclone.com`,
          is_verified: true,
          is_demo_user: true,
          created_at: new Date().toISOString(),
          followers_count: 0,
          following_count: 0,
          tweets_count: 0
        };
      }
      
      return response.data.user;
    }
  } catch (error) {
    console.error(`[${timestamp}] All demo login attempts failed:`, error);
    
    // Store the error for debugging
    localStorage.setItem('demoLoginError', JSON.stringify({
      timestamp: timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
      date: new Date().toISOString()
    }));
    
    throw new Error('Demo login failed. Please try again later.');
  }
};

export const isDemoUser = (): boolean => {
  // Simplified synchronous check to avoid additional API calls
  return localStorage.getItem('isDemoUser') === 'true';
};

const demoAuthService = {
  demoLogin,
  isDemoUser,
};

export default demoAuthService; 