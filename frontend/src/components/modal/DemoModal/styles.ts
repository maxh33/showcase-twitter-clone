import styled from 'styled-components';
import { Colors } from '../../../styles/global';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;
  
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
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${Colors.darkGray};
  transition: color 0.2s;
  
  &:hover {
    color: ${Colors.primary};
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 24px 12px;
  border-bottom: 1px solid ${Colors.extraLightGray};
`;

export const ModalIcon = styled.div`
  font-size: 24px;
  margin-right: 12px;
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${Colors.darkGray};
  margin: 0;
`;

export const ModalBody = styled.div`
  padding: 24px;
`;

export const Message = styled.p`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.5;
  color: ${Colors.darkGray};
`;

export const Benefits = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
  background-color: ${Colors.extraLightGray};
  border-radius: 12px;
  padding: 16px;
`;

export const BenefitItem = styled.li`
  margin-bottom: 12px;
  font-size: 15px;
  color: ${Colors.darkGray};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px 24px;
  gap: 12px;
`;

export const ButtonBase = styled.button`
  padding: 10px 20px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

export const CancelButton = styled(ButtonBase)`
  background-color: white;
  color: ${Colors.primary};
  border: 1px solid ${Colors.primary};
  
  &:hover {
    background-color: rgba(29, 161, 242, 0.1);
  }
`;

export const RegisterButton = styled(ButtonBase)`
  background-color: ${Colors.primary};
  color: white;
  border: 1px solid ${Colors.primary};
  
  &:hover {
    background-color: ${Colors.primary};
  }
`;
