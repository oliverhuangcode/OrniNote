import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import AnnotationPage from './pages/AnnotationPage/AnnotationPage';
import './styles/globals.css';

const App: React.FC = () => {
  // 🎯 CHANGE THIS LINE TO TEST DIFFERENT PAGES
  const currentPage = 'projects' as 'login' | 'projects' | 'annotation';
  
  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return <LoginPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'annotation':
        return <AnnotationPage />;
      default:
        return <ProjectsPage />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
};

export default App;