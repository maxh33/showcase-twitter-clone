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
  width: 100%;
  box-sizing: border-box;
  
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
  flex-shrink: 0;
`;

export const TweetContent = styled.div`
  flex: 1;
  min-width: 0; // Prevent flex item from overflowing
`;

export const TweetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  width: 100%;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0; // Prevent flex item from overflowing
`;

export const Username = styled.span`
  font-weight: 700;
  margin-right: 5px;
  color: ${Colors.black};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Handle = styled.span`
  color: ${Colors.darkGray};
  margin-right: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Timestamp = styled.span`
  color: ${Colors.darkGray};
  flex-shrink: 0;
`;

export const TweetText = styled.p`
  margin: 10px 0;
  color: ${Colors.black};
  font-size: 15px;
  line-height: 1.5;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  width: 100%;
`;

export const MediaContainer = styled.div`
  margin-top: 10px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${Colors.extraLightGray};
  width: 100%;
  max-width: 100%;
`;

export const MediaImage = styled.img`
  width: 100%;
  max-height: 350px;
  object-fit: cover;
`;

export const TweetFooter = styled.div`
  margin-top: 12px;
  width: 100%;
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

export const ActionButton = styled.button<ActionButtonProps>`
  background: none;
  border: none;
  color: ${Colors.darkGray};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 80px;
  
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
