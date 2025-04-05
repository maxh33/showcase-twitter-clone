import styled from 'styled-components';
import { Colors } from '../../styles/global';

export const HomeContainer = styled.div`
  display: flex;
  min-height: 100vh;
  max-width: 1300px;
  margin: 0 auto;
  position: relative;
  background-color: ${Colors.white};
  overflow: hidden; /* Contain the scrollable area within the Feed component */

  @media (max-width: 1200px) {
    max-width: 100%;
  }

  @media (max-width: 688px) {
    max-width: 100%;
    margin: 0;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  margin-left: 275px;

  @media (max-width: 1200px) {
    margin-left: 88px;
  }

  @media (max-width: 688px) {
    margin-left: 68px;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: ${Colors.white};
`; 