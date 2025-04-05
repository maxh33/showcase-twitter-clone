import styled from 'styled-components';
import { Colors } from '../../styles/global';

interface StyledButtonProps {
  variant: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  width: ${(props: StyledButtonProps) => props.fullWidth ? '100%' : 'auto'};
  margin-bottom: 10px;
  
  ${(props: StyledButtonProps) => props.variant === 'primary' && `
    background-color: ${Colors.primary};
    color: ${Colors.white};
    
    &:hover {
      background-color: ${Colors.primary};
      border-radius: 24px;
      box-shadow: 0 4px 8px rgba(29, 161, 242, 0.2);
    }
  `}
  
  ${(props: StyledButtonProps) => props.variant === 'secondary' && `
    background-color: transparent;
    color: ${Colors.primary};
    border: 1px solid ${Colors.primary};
    
    &:hover {
      background-color: rgba(29, 161, 242, 0.1);
      border-radius: 24px;
    }
  `}
  
  &:disabled {
    background-color: ${Colors.lightGray};
    color: ${Colors.darkGray};
    cursor: not-allowed;
    box-shadow: none;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;
