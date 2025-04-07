import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import { LoginData, LoginResponse } from '../types/auth';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  isUnverified: boolean;
  unverifiedEmail: string | null;
  successMessage: string | null;
  isDemoUser: boolean;
  login: (data: LoginData) => Promise<LoginResponse>;
  demoLogin: () => Promise<LoginResponse>;
  logout: () => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);

  const handleLogin = async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
    try {
      const response = await authService.login(credentials.username, credentials.password);
      
      if (response.requires_verification) {
        setIsUnverified(true);
        setUnverifiedEmail(response.email || null);
        return response;
      }
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setIsUnverified(false);
        setUnverifiedEmail(null);
        setError(null);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const handleDemoLogin = async (): Promise<LoginResponse> => {
    try {
      const response = await authService.demoLogin();
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setIsDemoUser(true);
        setIsUnverified(false);
        setUnverifiedEmail(null);
        setError(null);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during demo login';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    setIsUnverified(false);
    setUnverifiedEmail(null);
    setError(null);
    setSuccessMessage(null);
    setIsDemoUser(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          authService.setupAuthHeaders();
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    isLoggedIn,
    isLoading,
    error,
    isUnverified,
    unverifiedEmail,
    successMessage,
    isDemoUser,
    login: handleLogin,
    demoLogin: handleDemoLogin,
    logout: handleLogout,
    setError,
    setSuccessMessage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 