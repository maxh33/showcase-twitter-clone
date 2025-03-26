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
`;

const CURRENT_USER_KEY = 'twitter_clone_current_user';

const HomePage: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<RandomUser | null>(null);
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
            setCurrentUser(JSON.parse(storedUser));
          } else {
            // Fetch a new random user and store it
            const user = await fetchRandomUser();
            if (user) {
              setCurrentUser(user);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
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
      <Feed currentUser={currentUser} />
      <RightSidebar />
    </HomeContainer>
  );
};

export default HomePage;
