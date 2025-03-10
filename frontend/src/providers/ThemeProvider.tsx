import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Colors } from '../styles/global';

const theme = {
  colors: Colors,
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
};

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};