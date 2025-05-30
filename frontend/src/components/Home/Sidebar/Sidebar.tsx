import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../services/authService';
import { IconContext } from 'react-icons';
import * as S from './styles';

interface SidebarProps {
  activeItem?: 'home' | 'explore' | 'notifications' | 'messages' | 'bookmarks' | 'lists' | 'profile';
  userInfo?: {
    name: string;
    handle: string;
    avatar: string;
  };
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem = 'home',
  userInfo = { 
    name: 'Current User', 
    handle: 'user', 
    avatar: 'https://via.placeholder.com/50' 
  },
  onLogout
}) => {
  const navigate = useNavigate();
  
  const handleNavClick = (route: string) => {
    navigate(route);
  };
  
  const handleGitHubClick = () => {
    window.open('https://github.com/maxh33', '_blank');
  };
  
  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault();
    console.log('Sidebar: handleLogout called');
    
    // Call the provided onLogout handler
    if (typeof onLogout === 'function') {
      console.log('Sidebar: Calling provided onLogout handler');
      onLogout();
    } else {
      console.warn('Sidebar: No onLogout handler provided');
      // Fallback direct logout
      try {
        console.log('Sidebar: Attempting fallback direct logout');
        logout();
        // Force navigation to login page
        window.location.href = '/login';
      } catch (error) {
        console.error('Sidebar: Fallback logout failed:', error);
      }
    }
  };
  
  return (
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <S.SidebarContainer>
        <S.Logo onClick={() => handleNavClick('/')}>
          🐦
        </S.Logo>
        
        <S.Nav>
          <S.NavItem active={activeItem === 'home'} onClick={() => handleNavClick('/')}>
            🏠
            <S.NavText>Feed</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'explore'} onClick={handleGitHubClick}>
            #️⃣
            <S.NavText>Explore-ToDo</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'notifications'} onClick={handleGitHubClick}>
            🔔
            <S.NavText>Notifications-ToDo</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'messages'} onClick={handleGitHubClick}>
            ✉️
            <S.NavText>Messages-ToDo</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'bookmarks'} onClick={handleGitHubClick}>
            🔖
            <S.NavText>Bookmarks-ToDo</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'lists'} onClick={handleGitHubClick}>
            📋
            <S.NavText>Lists-ToDo</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'profile'} onClick={handleGitHubClick}>
            👤
            <S.NavText>Profile-ToDo</S.NavText>
          </S.NavItem>
          
          <S.NavItem onClick={handleLogout}>
            •••
            <S.NavText>Logout</S.NavText>
          </S.NavItem>
          
          <S.TweetButton onClick={() => handleNavClick('/')}>
            Tweet
          </S.TweetButton>
        </S.Nav>
        
        <S.ProfileSection>
          <S.Avatar src={userInfo.avatar} alt={userInfo.name} />
          <S.UserInfo>
            <S.UserName>{userInfo.name}</S.UserName>
            <S.UserHandle>@{userInfo.handle}</S.UserHandle>
          </S.UserInfo>
          •••
        </S.ProfileSection>
      </S.SidebarContainer>
    </IconContext.Provider>
  );
};

export default Sidebar; 