import React from 'react';
import { StyledButton } from './styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  fullWidth = false, 
  children, 
  ...props 
}) => {
  return (
    <StyledButton 
      variant={variant} 
      $fullWidth={fullWidth} 
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
