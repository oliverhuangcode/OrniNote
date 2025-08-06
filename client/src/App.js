import React from 'react';
import LoginPage from './pages/LoginPage/LoginPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import AnnotationPage from './pages/AnnotationPage/AnnotationPage';
import './App.css';

function App() {
  // CHANGE THIS LINE TO TEST DIFFERENT PAGES
  const currentPage = 'annotation'; // Change to: 'login', 'projects', 'annotation'
  
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
}

export default App;