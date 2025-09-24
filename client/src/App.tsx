import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/OnboardingPage/Login';
import Dashboard from './pages/ProjectsPage/Dashboard';
import Annotation from './pages/AnnotationPage/Annotation';
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
          
          {/* Annotation page with dynamic project ID */}
          <Route path="/annotation/:id" element={<Annotation />} />
          
          {/* Catch-all route - redirects unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
