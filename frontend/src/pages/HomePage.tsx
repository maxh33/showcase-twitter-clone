import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import styled from 'styled-components';
import Sidebar from '../components/Home/Sidebar/Sidebar';
import Feed from '../components/Home/Feed/Feed';
import RightSidebar from '../components/Home/RightSidebar/RightSidebar';
import { RandomUser, fetchRandomUser } from '../services/userGeneratorService';

// Home page with the Twitter-like UI
const HomeContainer = styled.div`
  display: flex;
  min-height: 100vh;
  max-width: 1300px;
  margin: 0 auto;
  background-color: white;
  height: 100vh;
  overflow: hidden; /* Contain the scrollable area within the Feed component */
`;

const CURRENT_USER_KEY = 'twitter_clone_current_user';

// Define a type that will convert RandomUser to the structure expected by Feed
interface FormattedUser {
  id: string | number;
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
              id: parsedUser.id || '1',
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
                id: user.id || '1',
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
    localStorage.removeItem(CURRENT_USER_KEY);
    navigate('/login');
  };
  
  if (!authenticated || loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }
  
  return (
    <HomeContainer>
      <Sidebar 
        activeItem="home" 
        userInfo={currentUser ? {
          name: currentUser.name,
          handle: currentUser.handle,
          avatar: currentUser.avatar
        } : undefined}
        onLogout={handleUserLogout}
      />
      <Feed currentUser={formattedUser} />
      <RightSidebar />
    </HomeContainer>
  );
};

export default HomePage;
