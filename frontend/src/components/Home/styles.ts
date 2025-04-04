import styled from 'styled-components';
import { Colors } from '../../styles/global';

export const HomeContainer = styled.div`
  display: flex;
  min-height: 100vh;
  max-width: 1300px;
  margin: 0 auto;
  background-color: ${Colors.white};
  height: 100vh;
  overflow: hidden;

  @media (max-width: 1024px) {
    max-width: 1000px;
  }

  @media (max-width: 688px) {
    max-width: 100%;
    width: 100%;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  max-width: calc(100% - 68px);  /* Account for collapsed sidebar on mobile */
  margin-left: auto;
  
  @media (max-width: 688px) {
    margin-left: 68px;  /* Width of collapsed sidebar */
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