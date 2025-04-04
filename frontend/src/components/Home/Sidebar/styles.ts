import styled from 'styled-components';
import { Colors } from '../../../styles/global';

export const SidebarContainer = styled.div`
  padding: 0 12px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  width: 275px;
  background-color: ${Colors.white};
  z-index: 10;
  border-right: 1px solid ${Colors.extraLightGray};

  @media (max-width: 1020px) {
    padding: 0 4px;
    align-items: center;
    width: 88px;
  }

  @media (max-width: 688px) {
    width: 68px;
    padding: 0 2px;
  }
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

  @media (max-width: 1020px) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: 1020px) {
    align-items: center;
    width: 100%;
  }
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

  @media (max-width: 1020px) {
    padding: 12px;
    justify-content: center;
    width: 50px;
    height: 50px;
    margin: 0 auto 8px auto;
  }
`;

export const NavText = styled.span`
  margin-left: 16px;
  font-size: 19px;

  @media (max-width: 1020px) {
    display: none;
  }
`;

export const TweetButton = styled.button`
  background-color: ${Colors.primary};
  color: white;
  border: none;
  border-radius: 30px;
  padding: 16px 32px;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 16px;
  width: 100%;
  
  &:hover {
    background-color: ${Colors.primaryLight};
  }

  @media (max-width: 1020px) {
    width: 50px;
    height: 50px;
    padding: 0;
    border-radius: 50%;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: '+';
    }
    span {
      display: none;
    }
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

  @media (max-width: 1020px) {
    padding: 8px;
    border-radius: 50%;
  }
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;

  @media (max-width: 1020px) {
    margin-right: 0;
  }
`;

export const UserInfo = styled.div`
  flex: 1;

  @media (max-width: 1020px) {
    display: none;
  }
`;

export const UserName = styled.div`
  font-weight: bold;
`;

export const UserHandle = styled.div`
  color: ${Colors.darkGray};
`; 