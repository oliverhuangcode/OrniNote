import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/OnboardingPage/Login';
import Dashboard from './pages/ProjectsPage/Dashboard';
import AnnotationPage from './pages/AnnotationPage/AnnotationPage';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/annotation" element={<AnnotationPage />} />
        {/* Catch-all route */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
