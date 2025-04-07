import React from 'react';
import { CircularProgress, Box, CircularProgressProps } from '@mui/material';

interface SpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 24, 
  color = 'primary' 
}) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default Spinner; 