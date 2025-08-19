import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Bird Annotation Tool
        </h1>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Sign In</h2>
          {/* Login form will go here */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;