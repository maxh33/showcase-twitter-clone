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
  
  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) {
        onLogout();
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
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
          
          <S.NavItem active={activeItem === 'explore'} onClick={() => handleNavClick('/explore')}>
            #️⃣
            <S.NavText>Explore</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'notifications'} onClick={() => handleNavClick('/notifications')}>
            🔔
            <S.NavText>Notifications</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'messages'} onClick={() => handleNavClick('/messages')}>
            ✉️
            <S.NavText>Messages</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'bookmarks'} onClick={() => handleNavClick('/bookmarks')}>
            🔖
            <S.NavText>Bookmarks</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'lists'} onClick={() => handleNavClick('/lists')}>
            📋
            <S.NavText>Lists</S.NavText>
          </S.NavItem>
          
          <S.NavItem active={activeItem === 'profile'} onClick={() => handleNavClick('/profile')}>
            👤
            <S.NavText>Profile</S.NavText>
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