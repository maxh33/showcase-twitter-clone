import styled from 'styled-components';
import { Colors } from '../../../styles/global';

export const SidebarContainer = styled.div`
  padding: 0 12px;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${Colors.extraLightGray};
`;

export const Logo = styled.div`
  color: ${Colors.primary};
  font-size: 30px;
  padding: 12px;
  margin-bottom: 8px;
  width: fit-content;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(29, 161, 242, 0.1);
  }
`;

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 30px;
  font-size: 20px;
  font-weight: ${props => props.active ? 700 : 400};
  color: ${props => props.active ? Colors.primary : Colors.black};
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

export const NavText = styled.span`
  margin-left: 16px;
  font-size: 19px;
`;

export const TweetButton = styled.button`
  background-color: ${Colors.primary};
  color: white;
  border: none;
  border-radius: 30px;
  padding: 16px 0;
  font-weight: bold;
  font-size: 17px;
  width: 100%;
  margin: 16px 0;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1a91da;
  }
`;

export const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 30px;
  margin-top: auto;
  margin-bottom: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
`;

export const UserInfo = styled.div`
  flex: 1;
`;

export const UserName = styled.div`
  font-weight: bold;
`;

export const UserHandle = styled.div`
  color: ${Colors.darkGray};
`; 