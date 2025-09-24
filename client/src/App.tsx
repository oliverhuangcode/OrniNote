import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/OnboardingPage/Login';
import Dashboard from './pages/ProjectsPage/Dashboard';
import AcceptInvite from './components/modals/AcceptInviteModal/AcceptInvite';
import AnnotationCanvas from './pages/AnnotationPage/Annotation';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Default route - redirects to dashboard */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard/Projects page */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Annotation page with dynamic project ID - FIXED PARAMETER NAME */}
          <Route path="/annotation/:id" element={<AnnotationCanvas />} />

          {/* Accept invite */}
          <Route path="/accept-invite" element={<AcceptInvite />} />
          
          {/* Catch-all route - redirects unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
