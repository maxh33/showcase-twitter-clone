import styled from 'styled-components';
import { Colors } from '../../../styles/global';

export const RightSidebarContainer = styled.div`
  width: 350px;
  padding: 0 16px;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
`;

export const SearchContainer = styled.div`
  position: relative;
  margin-top: 8px;
  margin-bottom: 16px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border-radius: 30px;
  border: none;
  background-color: ${Colors.extraLightGray};
  color: ${Colors.black};
  font-size: 15px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    background-color: white;
    border: 1px solid ${Colors.primary};
  }
  
  &::placeholder {
    color: ${Colors.darkGray};
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${Colors.darkGray};
`;

export const Card = styled.div`
  background-color: ${Colors.extraLightGray};
  border-radius: 16px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
`;

export const CardHeader = styled.div`
  padding: 12px 16px;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
`;

export const CardFooter = styled.div`
  padding: 16px;
  color: ${Colors.primary};
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
    border-bottom-right-radius: 16px;
    border-bottom-left-radius: 16px;
  }
`;

export const TrendItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TrendCategory = styled.div`
  font-size: 13px;
  color: ${Colors.darkGray};
`;

export const TrendTitle = styled.div`
  font-weight: bold;
  font-size: 15px;
  margin: 4px 0;
`;

export const TrendTweets = styled.div`
  font-size: 13px;
  color: ${Colors.darkGray};
`;

export const SuggestedUser = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  width: 100%;
  box-sizing: border-box;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
`;

export const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const UserName = styled.div`
  font-weight: bold;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserHandle = styled.div`
  color: ${Colors.darkGray};
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FollowButton = styled.button`
  background-color: ${Colors.black};
  color: white;
  border: none;
  border-radius: 30px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background-color: ${Colors.darkGray};
  }
`;

export const LoadingState = styled.div`
  padding: 16px;
  text-align: center;
  color: ${Colors.darkGray};
  font-size: 14px;
`;

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 0 16px;
`;

export const FooterLink = styled.a`
  color: ${Colors.darkGray};
  font-size: 13px;
  margin-right: 12px;
  margin-bottom: 4px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const Copyright = styled.div`
  color: ${Colors.darkGray};
  font-size: 13px;
  margin-top: 8px;
`;