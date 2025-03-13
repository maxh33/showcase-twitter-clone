import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/authService';
import Button from '../components/Button';
import styled from 'styled-components';
import { Colors } from '../styles/global';

//Just a dummy home page to test the authentication system
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: ${Colors.backgroundGray};
`;

const HomeContent = styled.div`
  max-width: 600px;
  width: 100%;
  background-color: ${Colors.white};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${Colors.black};
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 18px;
  color: ${Colors.darkGray};
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
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
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!authenticated) {
    return null; // Will redirect to login in useEffect
  }
  
  return (
    <HomeContainer>
      <HomeContent>
        <Title>Welcome to Twitter Clone</Title>
        <Message>Login Successfully! Welcome to the Home Page</Message>
        <Message>
          This is a simple showcase of a Twitter clone. The authentication system is now working.
        </Message>
        
        <ButtonGroup>
          <Button
            variant="primary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </ButtonGroup>
      </HomeContent>
    </HomeContainer>
  );
};

export default HomePage;
