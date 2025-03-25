import styled from 'styled-components';
import { Colors } from '../../../styles/global';

export const FeedContainer = styled.div`
  width: 600px;
  border-left: 1px solid ${Colors.extraLightGray};
  border-right: 1px solid ${Colors.extraLightGray};
`;

export const FeedHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${Colors.extraLightGray};
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  z-index: 1;
  display: flex;
  align-items: center;
`;

export const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px 0;
  color: ${Colors.primary};
  font-size: 20px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadMoreButton = styled.button`
  background-color: transparent;
  color: ${Colors.primary};
  border: none;
  padding: 16px;
  width: 100%;
  cursor: pointer;
  font-weight: bold;
  border-top: 1px solid ${Colors.extraLightGray};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

export const EmptyState = styled.div`
  padding: 40px 16px;
  text-align: center;
  color: ${Colors.darkGray};
`; 