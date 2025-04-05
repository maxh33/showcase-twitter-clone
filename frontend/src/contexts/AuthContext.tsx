import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import * as authService from '../services/authService';
import * as demoAuthService from '../services/demoAuthService';

// Make sure auth service is initialized with proper headers
authService.setupAuthHeaders();

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isUnverified: boolean;
  unverifiedEmail: string | null;
  successMessage: string | null;
  isDemoUser: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setUnverifiedEmail: React.Dispatch<React.SetStateAction<string | null>>;
  setIsUnverified: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    const checkDemoUser = async () => {
      try {
        const isDemo = await demoAuthService.isDemoUser();
        setIsDemoUser(isDemo);
      } catch (error) {
        console.error('Error checking demo user status:', error);
        setIsDemoUser(false);
      }
    };

    // Check local storage first for faster response
    setIsDemoUser(localStorage.getItem('isDemoUser') === 'true');
    
    // Then verify with backend if possible
    checkDemoUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authService.login({ email: identifier, password });
      
      if (response.user) {
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

  const handleDemoLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Try the server-side demo login first
      try {
        const demoUser = await demoAuthService.demoLogin();
        setUser(demoUser);
        setIsDemoUser(true);
      } catch (serverError) {
        console.error('Server-side demo login failed, using client-side fallback', serverError);
        
        // Fallback to client-side demo login
        await authService.demoLogin();
        setIsDemoUser(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to create demo login');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsDemoUser(false);
    } catch (error) {
      console.error('Logout error:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
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