import styled from 'styled-components';
import { Colors } from '../../styles/global';

interface ActionButtonProps {
  $active?: boolean;
}

export const TweetContainer = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid ${Colors.extraLightGray};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

export const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

export const TweetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

export const Username = styled.span`
  font-weight: 700;
  margin-right: 5px;
  color: ${Colors.black};
`;

export const Handle = styled.span`
  color: ${Colors.darkGray};
  margin-right: 5px;
`;

export const Timestamp = styled.span`
  color: ${Colors.darkGray};
`;

export const TweetContent = styled.p`
  margin: 10px 0;
  color: ${Colors.black};
  font-size: 15px;
  line-height: 1.5;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

export const MediaContainer = styled.div`
  margin-top: 10px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${Colors.extraLightGray};
`;

export const MediaImage = styled.img`
  width: 100%;
  max-height: 350px;
  object-fit: cover;
`;

export const TweetFooter = styled.div`
  margin-top: 12px;
`;

export const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 425px;
`;

export const ActionButton = styled.button<ActionButtonProps>`
  background: none;
  border: none;
  color: ${Colors.darkGray};
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: ${({ $active }) => 
      $active 
        ? 'rgba(224, 36, 94, 0.1)' 
        : 'rgba(29, 161, 242, 0.1)'};
    color: ${Colors.primary};
  }
  
  span {
    margin-left: 5px;
    font-size: 14px;
  }
`;
