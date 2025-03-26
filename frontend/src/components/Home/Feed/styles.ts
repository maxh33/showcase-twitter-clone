import styled from 'styled-components';
import { Colors } from '../../../styles/global';

export const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${Colors.lightGray};
  border-left: 1px solid ${Colors.lightGray};
  width: 100%;
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow-y: auto;
  
  /* Responsive styles */
  @media (max-width: 768px) {
    max-width: 100%;
    border-left: none;
    border-right: none;
  }
`;

export const FeedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid ${Colors.lightGray};
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  z-index: 10;
`;

export const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: ${Colors.darkGray};
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const TweetContainer = styled.div`
  transition: all 0.3s ease-in-out;
  animation: fadeIn 0.5s ease-in-out;
  padding: 15px;
  border-bottom: 1px solid ${Colors.lightGray};
  display: flex;
  
  &:hover {
    background-color: ${Colors.extraLightGray};
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

export const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  color: ${Colors.darkGray};
  font-size: 18px;
  
  @media (max-width: 480px) {
    padding: 20px;
    font-size: 16px;
  }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  color: ${Colors.primary};
  font-size: 24px;
  
  .spinner-icon {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadMoreButton = styled.button`
  padding: 10px;
  margin: 15px auto;
  background-color: ${Colors.primary};
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  width: 80%;
  max-width: 200px;
  
  &:hover {
    background-color: ${Colors.primary};
    opacity: 0.8;
  }
  
  @media (max-width: 480px) {
    width: 90%;
  }
`; 