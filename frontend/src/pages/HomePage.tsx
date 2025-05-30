import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/authService';
import Home from '../components/Home';
import { RandomUser, fetchRandomUser } from '../services/userGeneratorService';
import { useAuth } from '../contexts/AuthContext';

const CURRENT_USER_KEY = 'twitter_clone_current_user';

// Define a type that will convert RandomUser to the structure expected by Feed
interface FormattedUser {
  id: string;
  username: string;
  profile_picture: string | null;
  email: string;
}

const HomePage: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<RandomUser | null>(null);
  const [formattedUser, setFormattedUser] = useState<FormattedUser | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout: authContextLogout } = useAuth();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      setAuthenticated(true);
      // Load or create the current user
      const loadOrCreateRandomUser = async () => {
        setLoading(true);
        try {
          // First check if we have a stored user
          const storedUser = localStorage.getItem(CURRENT_USER_KEY);
          
          if (storedUser) {
            // Use the stored user
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);
            // Format user for Feed component
            setFormattedUser({
              id: String(parsedUser.id || '1'),
              username: parsedUser.name || 'User',
              profile_picture: parsedUser.avatar || null,
              email: parsedUser.email || 'user@example.com'
            });
          } else {
            // Fetch a new random user and store it
            const user = await fetchRandomUser();
            if (user) {
              setCurrentUser(user);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
              // Format user for Feed component
              setFormattedUser({
                id: String(user.id || '1'),
                username: user.name || 'User',
                profile_picture: user.avatar || null,
                email: user.email || 'user@example.com'
              });
            }
          }
        } catch (error) {
          console.error('Error loading random user:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadOrCreateRandomUser();
    }
  }, [navigate]);
  
  // Function to clear user data on logout
  const handleUserLogout = () => {
    console.log('Starting logout process...');
    
    // 1. Clear all storage related to the user
    localStorage.clear(); // Clear localStorage
    sessionStorage.clear(); // Clear sessionStorage
    
    // 2. Clear state
    setAuthenticated(false);
    setCurrentUser(null);
    setFormattedUser(undefined);
    
    // 3. Quick attempt to call auth context logout function
    if (typeof authContextLogout === 'function') {
      try {
        console.log('Calling auth context logout...');
        authContextLogout();
        console.log('Auth context logout complete');
      } catch (error) {
        console.error('Auth context logout failed:', error);
      }
    }
    
    // 4. Try a service logout as backup
    try {
      console.log('Calling service logout...');
      logout();
      console.log('Service logout complete');
    } catch (error) {
      console.error('Service logout failed:', error);
      // Even if service logout fails, we should still redirect
    }
    
    console.log('Auth data cleared, forcing hard redirect to login page...');
    
    // 5. Force page reload directly to the login page
    setTimeout(() => {
      console.log('Executing redirect to login page...');
      window.location.href = '/login';
    }, 100); // Short timeout to ensure state updates complete
    
    // 6. Return null to prevent any further execution
    return null;
  };
  
  return (
    <Home
      authenticated={authenticated}
      loading={loading}
      currentUser={currentUser ? {
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar
      } : undefined}
      formattedUser={formattedUser}
      onLogout={handleUserLogout}
    />
  );
};

export default HomePage;
