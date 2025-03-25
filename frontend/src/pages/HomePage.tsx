import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import styled from 'styled-components';
import Sidebar from '../components/Home/Sidebar/Sidebar';
import Feed from '../components/Home/Feed/Feed';
import RightSidebar from '../components/Home/RightSidebar/RightSidebar';

// Home page with the Twitter-like UI
const HomeContainer = styled.div`
  display: flex;
  min-height: 100vh;
  max-width: 1300px;
  margin: 0 auto;
  background-color: white;
`;

const HomePage: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      setAuthenticated(true);
    }
  }, [navigate]);
  
  if (!authenticated) {
    return null; // Will redirect to login in useEffect
  }
  
  return (
    <HomeContainer>
      <Sidebar activeItem="home" />
      <Feed />
      <RightSidebar />
    </HomeContainer>
  );
};

export default HomePage;
