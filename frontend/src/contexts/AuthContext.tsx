import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import * as authService from '../services/authService';
import * as demoAuthService from '../services/demoAuthService';
import axios from 'axios';

// Make sure auth service is initialized with proper headers
authService.setupAuthHeaders();

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  isUnverified: boolean;
  unverifiedEmail: string | null;
  successMessage: string | null;
  isDemoUser: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: (silentMode?: boolean) => Promise<boolean>;
  demoLogin: () => Promise<User | null>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setUnverifiedEmail: React.Dispatch<React.SetStateAction<string | null>>;
  setIsUnverified: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get API URL for user profile fetching
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('debug-api-url') || 
           (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : 'https://maxh33.pythonanywhere.com/api');
  }
  return 'https://maxh33.pythonanywhere.com/api';
};

// Helper function to fetch user profile
const fetchUserProfile = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Set authorization header
    const apiUrl = getApiUrl();
    // Try to get user profile using /auth/user/me/ endpoint which is standard in Django REST
    const response = await axios.get(`${apiUrl}/v1/auth/user/me/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuthState = async () => {
      setIsLoading(true);
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('token');
        if (token) {
          // Set auth headers with the token
          authService.setupAuthHeaders();
          
          // Fetch the user profile from backend
          const userProfile = await fetchUserProfile();
          
          if (userProfile) {
            setUser(userProfile);
            
            // Check if user is demo user
            const isDemo = localStorage.getItem('isDemoUser') === 'true' || userProfile.is_demo_user;
            setIsDemoUser(isDemo);
          } else {
            // If profile fetch fails, handle gracefully with a placeholder
            const isDemo = localStorage.getItem('isDemoUser') === 'true';
            setIsDemoUser(isDemo);
            
            // Create a basic user object as fallback
            setUser({
              id: '0', // placeholder ID as string
              username: 'user', // placeholder
              email: '', // placeholder
              is_verified: true, // assume verified since they have a token
              is_demo_user: isDemo,
              created_at: new Date().toISOString(),
              followers_count: 0,
              following_count: 0,
              tweets_count: 0
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        // If there's an error, clear the auth state
        authService.silentLogout();
        setUser(null);
        setIsDemoUser(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthState();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.login({ email: identifier, password });
      
      // After login, fetch the user profile
      const userProfile = await fetchUserProfile();
      
      if (userProfile) {
        setUser(userProfile);
        setIsDemoUser(userProfile.is_demo_user || authService.isDemoUser());
      } else if (response.user) {
        if (
          typeof response.user === 'object' && 
          'id' in response.user && 
          'username' in response.user && 
          'email' in response.user
        ) {
          setUser(response.user as unknown as User);
          setIsDemoUser(authService.isDemoUser());
        } else {
          console.error('User data from API does not match expected format', response.user);
          setError('Invalid user data received from server');
        }
      } else {
        // If no user data in response, create a basic user object
        const isDemo = authService.isDemoUser();
        setUser({
          id: '0', // placeholder ID as string
          username: 'user',
          email: identifier.includes('@') ? identifier : '',
          is_verified: true,
          is_demo_user: isDemo,
          created_at: new Date().toISOString(),
          followers_count: 0,
          following_count: 0,
          tweets_count: 0
        });
        setIsDemoUser(isDemo);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (): Promise<User | null> => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Starting demo login process...');
      
      // Check if we already have a demo user (avoid repeated API calls)
      const existingDemoUser = localStorage.getItem('demoUser');
      const hasExistingToken = localStorage.getItem('token');
      
      if (existingDemoUser && hasExistingToken) {
        try {
          console.log('Using existing demo user data from localStorage');
          const parsedDemoUser = JSON.parse(existingDemoUser) as User;
          
          // Set the user state directly
          setUser(parsedDemoUser);
          setIsDemoUser(true);
          setIsLoading(false);
          
          return parsedDemoUser;
        } catch (parseError) {
          console.error('Error parsing stored demo user:', parseError);
          // Continue to other login methods
        }
      }
      
      // Try to use the demoAuthService which has robust fallback mechanisms
      try {
        console.log('Attempting to use demoAuthService.demoLogin()...');
        const demoUser = await demoAuthService.demoLogin();
        
        // If we got a user object, set it and return
        if (demoUser) {
          console.log('Demo login successful, user retrieved:', demoUser);
          setUser(demoUser);
          setIsDemoUser(true);
          
          // Ensure our app state is consistent
          localStorage.setItem('currentUser', JSON.stringify(demoUser));
          localStorage.setItem('isDemoUser', 'true');
          
          setIsLoading(false);
          return demoUser;
        }
      } catch (demoServiceError) {
        console.error('Demo service login failed:', demoServiceError);
        // No need to continue to fallback approach since demoAuthService has its own fallbacks
      }
      
      // Create a guaranteed fallback demo user as a last resort
      console.log('Creating guaranteed fallback demo user');
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 10);
      const fallbackDemoUser: User = {
        id: `emergency_${timestamp}`,
        username: `demo_emergency_${timestamp}`,
        email: `demo+${timestamp}@twitterclone.com`,
        is_verified: true,
        is_demo_user: true,
        created_at: new Date().toISOString(),
        followers_count: 0,
        following_count: 0,
        tweets_count: 0
      };
      
      // Set up auth state to maintain consistency
      localStorage.setItem('token', 'emergency_demo_token');
      localStorage.setItem('refreshToken', 'emergency_demo_refresh');
      localStorage.setItem('demoUser', JSON.stringify(fallbackDemoUser));
      localStorage.setItem('isDemoUser', 'true');
      
      // Update authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer emergency_demo_token`;
      
      // Update state
      setUser(fallbackDemoUser);
      setIsDemoUser(true);
      
      setIsLoading(false);
      return fallbackDemoUser;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to create demo login');
      }
      
      // Even after all errors, try to return a minimal user object
      // This ensures the app can still function even if everything fails
      const emergencyUser: User = {
        id: 'absolute_emergency',
        username: 'emergency_demo',
        email: 'emergency@demo.com',
        is_verified: true,
        is_demo_user: true,
        created_at: new Date().toISOString(),
        followers_count: 0,
        following_count: 0,
        tweets_count: 0
      };
      
      // Set up auth state to maintain consistency even in error case
      localStorage.setItem('token', 'absolute_emergency_token');
      localStorage.setItem('refreshToken', 'absolute_emergency_refresh');
      localStorage.setItem('demoUser', JSON.stringify(emergencyUser));
      localStorage.setItem('isDemoUser', 'true');
      
      // Update authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer absolute_emergency_token`;
      
      setUser(emergencyUser);
      setIsDemoUser(true);
      setIsLoading(false);
      
      return emergencyUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (silentMode = false) => {
    setIsLoading(true);
    
    // Immediately clear state to prevent any race conditions or updates after unmount
    setUser(null);
    setIsDemoUser(false);
    
    try {
      // Only actually call API logout if we're not in silent mode
      // Silent mode is used when we just want to clear state without waiting for API
      if (!silentMode) {
        await authService.logout();
      } else {
        // If in silent mode, just clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isDemoUser');
      }
      
      // Don't repeat the localStorage removal if we're not in silent mode
      // as authService.logout() already does this
      
      // Reset state again just to be safe
      setUser(null);
      setIsDemoUser(false);
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still reset state even if the API call fails
      setUser(null);
      setIsDemoUser(false);
      
      // Clear storage even on error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isDemoUser');
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    error,
    isUnverified,
    unverifiedEmail,
    successMessage,
    isDemoUser,
    login,
    logout,
    demoLogin: handleDemoLogin,
    setError,
    setSuccessMessage,
    setUnverifiedEmail,
    setIsUnverified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 