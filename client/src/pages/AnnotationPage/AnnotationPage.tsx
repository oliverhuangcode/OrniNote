import React from 'react';

const AnnotationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="h-screen flex">
        {/* Toolbar */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 p-2">
          <h2 className="text-sm font-medium mb-4">Tools</h2>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 bg-gray-100 relative">
          <div className="absolute inset-4 bg-white rounded shadow-lg flex items-center justify-center">
            <p className="text-gray-500">Canvas Area</p>
          </div>
        </div>
        
        {/* Layers Panel */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
          <h2 className="text-sm font-medium mb-4">Layers</h2>
        </div>
      </div>
    </div>
  );
};

export default AnnotationPage;