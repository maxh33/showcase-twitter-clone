import React from 'react';
import { GlobalStyles } from './styles/global';
import { AppThemeProvider } from './providers/ThemeProvider';

const App: React.FC = () => {
  return (
    <AppThemeProvider>
      <GlobalStyles />
      {/* App components */}
    </AppThemeProvider>
  );
};

export default App;
