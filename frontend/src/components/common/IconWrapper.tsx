import React from 'react';
import styled from 'styled-components';
import { IconType } from 'react-icons';
import { Colors } from '../../styles/global';

interface IconWrapperStyleProps {
  $disabled?: boolean;
  $active?: boolean;
  $size?: 'small' | 'medium' | 'large';
  $color?: string;
  $asButton?: boolean;
}

interface IconWrapperProps {
  icon: IconType;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  asButton?: boolean;
}

// Common styles shared between both components
const commonStyles = `
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(29, 161, 242, 0.1);
  }
`;

const IconWrapperStyled = styled.span<IconWrapperStyleProps>`
  ${commonStyles}
  opacity: ${props => props.$disabled ? 0.5 : 1};
  color: ${props => props.$color || 'inherit'};

  ${props => props.$size === 'small' && `
    padding: 6px;
  `}

  ${props => props.$size === 'large' && `
    padding: 12px;
  `}

  ${props => props.$active && `
    color: ${Colors.primary};
    &:hover {
      background-color: rgba(29, 161, 242, 0.1);
    }
  `}
`;

// Button version with additional button-specific styles
const IconWrapperButton = styled.button<IconWrapperStyleProps>`
  ${commonStyles}
  background: none;
  border: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  color: ${props => props.$color || 'inherit'};

  ${props => props.$size === 'small' && `
    padding: 6px;
  `}

  ${props => props.$size === 'large' && `
    padding: 12px;
  `}

  ${props => props.$active && `
    color: ${Colors.primary};
    &:hover {
      background-color: rgba(29, 161, 242, 0.1);
    }
  `}

  &:hover {
    background-color: ${props => props.$disabled ? 'transparent' : 'rgba(29, 161, 242, 0.1)'};
  }
`;

function getIconSize(size?: 'small' | 'medium' | 'large'): number {
  switch (size) {
    case 'small': return 16;
    case 'large': return 24;
    default: return 20;
  }
}

// Type for our refs to avoid 'any'
type IconWrapperRefType = HTMLButtonElement | HTMLSpanElement;

// Properly typed rest props by extending React's HTMLAttributes
type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof IconWrapperProps>;
type SpanProps = Omit<React.HTMLAttributes<HTMLSpanElement>, keyof IconWrapperProps>;

// Union type to correctly type the spreading of props
type IconWrapperRestProps = ButtonProps | SpanProps;

const IconWrapper = React.forwardRef<IconWrapperRefType, IconWrapperProps & IconWrapperRestProps>(({ 
  icon,
  disabled,
  active,
  size,
  color,
  asButton = true,
  ...props 
}, ref) => {
  const iconSize = getIconSize(size);
  const Icon = icon;
  
  // Determine which component to use based on asButton prop
  if (asButton) {
    return (
      <IconWrapperButton
        ref={ref as React.RefObject<HTMLButtonElement>}
        $disabled={disabled}
        $active={active}
        $size={size}
        $color={color}
        $asButton={asButton}
        {...props as ButtonProps}
      >
        <Icon size={iconSize} color={color || 'currentColor'} />
      </IconWrapperButton>
    );
  }
  
  return (
    <IconWrapperStyled
      ref={ref as React.RefObject<HTMLSpanElement>}
      $disabled={disabled}
      $active={active}
      $size={size}
      $color={color}
      $asButton={asButton}
      {...props as SpanProps}
    >
      <Icon size={iconSize} color={color || 'currentColor'} />
    </IconWrapperStyled>
  );
});

IconWrapper.displayName = 'IconWrapper';

export default IconWrapper; 