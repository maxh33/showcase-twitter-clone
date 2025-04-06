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
      return 'https://maxh33.pythonanywhere.com/api/v1';
    }
  }
  
  // Fallback for non-browser environments
  console.log('Fallback to production API URL');
  return 'https://maxh33.pythonanywhere.com/api/v1';
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

// Create a reliable local demo user without requiring backend authentication
const createLocalDemoUser = (timestamp: string): User => {
  console.log(`[${timestamp}] Creating reliable local demo user without backend authentication`);
  
  // Create a fallback user with timestamp to ensure uniqueness
  const fallbackUser: User = {
    id: `local_${timestamp}`,
    username: `demo_user_${timestamp}`,
    email: `demo_${timestamp}@twitterclone.com`,
    is_verified: true,
    is_demo_user: true,
    bio: 'This is a local demo account for testing',
    profile_picture: '/logo192.png',
    created_at: new Date().toISOString(),
    followers_count: 0,
    following_count: 0,
    tweets_count: 0
  };
  
  // Store the local user state consistently
  localStorage.setItem('token', 'demo_mock_token'); // Mock token to satisfy auth checks
  localStorage.setItem('refreshToken', 'demo_mock_refresh_token');
  localStorage.setItem('isDemoUser', 'true');
  localStorage.setItem('demoTimestamp', timestamp);
  localStorage.setItem('demoUser', JSON.stringify(fallbackUser));
  
  // Set auth header to maintain consistency
  axios.defaults.headers.common['Authorization'] = `Bearer demo_mock_token`;
  
  return fallbackUser;
};

// Improved demo login with detailed logging and fallbacks
export const demoLogin = async (): Promise<User> => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').substring(0, 15);
  console.log(`[${timestamp}] Starting demo login process...`);
  
  // Check if we already have a demo user stored - use it to avoid API calls
  const existingDemoUser = localStorage.getItem('demoUser');
  if (existingDemoUser) {
    try {
      console.log(`[${timestamp}] Using existing demo user from localStorage`);
      const user = JSON.parse(existingDemoUser) as User;
      
      // Ensure we have the demo tokens set
      if (!localStorage.getItem('token')) {
        localStorage.setItem('token', 'demo_mock_token');
        localStorage.setItem('refreshToken', 'demo_mock_refresh_token');
        localStorage.setItem('isDemoUser', 'true');
        axios.defaults.headers.common['Authorization'] = `Bearer demo_mock_token`;
      }
      
      return user;
    } catch (error) {
      console.error(`[${timestamp}] Error parsing existing demo user:`, error);
      // Continue to create a new one
    }
  }
  
  try {
    // For production deployments, just use local demo user to avoid API errors
    if (typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      
      console.log(`[${timestamp}] Skipping API login in production, using local demo user`);
      return createLocalDemoUser(timestamp);
    }
    
    // Only try API login for local development
    console.log(`[${timestamp}] Using regular login with demo user credentials...`);
    const loginUrl = buildUrl('auth/login/');
    
    try {
      // Use a consistent demo account for better reliability
      const response = await axios.post(loginUrl, {
        email: 'demo@twitterclone.com',
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
        const demoUser = {
          id: response.data.user_id || '0',
          username: 'demo_user',
          email: 'demo@twitterclone.com',
          is_verified: true,
          is_demo_user: true,
          created_at: new Date().toISOString(),
          followers_count: 0,
          following_count: 0,
          tweets_count: 0
        };
        
        // Store the demo user in localStorage for access across components
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        return demoUser;
      }
      
      // Mark the user as a demo user
      const enhancedUser = {
        ...response.data.user,
        is_demo_user: true
      };
      
      // Store the demo user in localStorage for access across components
      localStorage.setItem('demoUser', JSON.stringify(enhancedUser));
      return enhancedUser;
    } catch (error: unknown) {
      console.error(`[${timestamp}] Regular demo login failed:`, error);
      return createLocalDemoUser(timestamp);
    }
  } catch (error) {
    console.error(`[${timestamp}] All demo login attempts failed:`, error);
    
    // Store the error for debugging
    localStorage.setItem('demoLoginError', JSON.stringify({
      timestamp: timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
      date: new Date().toISOString()
    }));
    
    // Always return a working demo user even after errors
    return createLocalDemoUser(timestamp);
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