import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles } from './styles/global';
import { AppThemeProvider } from './providers/ThemeProvider';
import { setupAuthHeaders } from './services/authService';
import { AuthProvider } from './contexts/AuthContext';
import AuthRoute from './components/AuthRoute';

// Pages
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ConfirmPasswordResetPage from './pages/ConfirmPasswordResetPage';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  useEffect(() => {
    // Setup auth headers on app initialization
    setupAuthHeaders();
  }, []);

  return (
    <AppThemeProvider>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes - accessible only to non-authenticated users */}
            <Route path="/signup" element={<AuthRoute element={<SignupPage />} requireAuth={false} />} />
            <Route path="/login" element={<AuthRoute element={<LoginPage />} requireAuth={false} />} />
            <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password/confirm/:uid/:token" element={<ConfirmPasswordResetPage />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/" element={<AuthRoute element={<HomePage />} />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </AppThemeProvider>
  );
};

export default App;
