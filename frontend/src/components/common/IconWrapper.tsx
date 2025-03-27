import React from 'react';
import type { IconType } from 'react-icons';

interface IconWrapperProps {
  icon: IconType;
  size?: number;
  color?: string;
}

// Use the function as a regular function, not a component
const IconWrapper = ({ icon: Icon, size = 20, color }: IconWrapperProps) => {
  // Cast the result to any to avoid type errors
  return React.createElement(Icon as any, { size, color });
};

export default IconWrapper; 