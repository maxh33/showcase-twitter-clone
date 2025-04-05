import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles } from './styles/global';
import { AppThemeProvider } from './providers/ThemeProvider';
import { setupAuthHeaders, isAuthenticated } from './services/authService';

// Pages
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ConfirmPasswordResetPage from './pages/ConfirmPasswordResetPage';
import HomePage from './pages/HomePage';

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  useEffect(() => {
    // Setup auth headers on app initialization
    setupAuthHeaders();
  }, []);

  return (
    <AppThemeProvider>
      <GlobalStyles />
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password/confirm/:uid/:token" element={<ConfirmPasswordResetPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppThemeProvider>
  );
};

export default App;
