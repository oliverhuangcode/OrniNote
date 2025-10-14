import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';
import { ProtectedRoute } from './components/protectedRoute';
import Auth from './pages/OnboardingPage/Auth';
import Dashboard from './pages/ProjectsPage/Dashboard';
import AcceptInvite from './components/modals/AcceptInviteModal/AcceptInvite';
import { AnnotationCanvas } from './pages/AnnotationPage/Annotation';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annotation/:id"
            element={
              <ProtectedRoute>
                <AnnotationCanvas />
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;