import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/OnboardingPage/Login';
import Dashboard from './pages/ProjectsPage/Dashboard';
import Annotation from './pages/AnnotationPage/Annotation';
import Whiteboard from './pages/AnnotationPage/Whiteboard';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/annotation" element={<Annotation />} />
        <Route path="/whiteboard" element={<Whiteboard />} />
        {/* Catch-all route */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
