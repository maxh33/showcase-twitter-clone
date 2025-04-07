import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../components/Home';
import { useAuth } from '../contexts/AuthContext';
import { FormattedUser } from '../types/user';

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
    setLoading(false);
  }, [isLoggedIn, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const formattedUser: FormattedUser | undefined = user ? {
    id: String(user.id),
    username: user.username,
    profile_picture: user.profile_picture,
    email: user.email
  } : undefined;
  
  const currentUser = user ? {
    name: user.username,
    handle: user.username,
    avatar: user.profile_picture || '/default-avatar.png'
  } : undefined;
  
  return (
    <Home
      authenticated={isLoggedIn}
      loading={loading}
      currentUser={currentUser}
      formattedUser={formattedUser}
      onLogout={handleLogout}
    />
  );
};

export default HomePage;
