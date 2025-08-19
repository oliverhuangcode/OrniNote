import React from 'react';
import { MOCK_PROJECTS, CURRENT_USER, getProjectsByUser } from '../../utils/mockData';

const ProjectsPage: React.FC = () => {
  const userProjects = getProjectsByUser(CURRENT_USER.id);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map(project => (
            <div key={project.id} className="card hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              <p className="text-gray-600 text-sm">{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;