export const LoadingState = () => (
  <div className="h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="text-xl font-semibold text-gray-900 mb-2">
        Loading Project...
      </div>
      <div className="text-gray-500">
        Please wait while we load your annotation project.
      </div>
    </div>
  </div>
);

export const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="text-xl font-semibold text-red-600 mb-2">
        Error Loading Project
      </div>
      <div className="text-gray-500 mb-4">{error}</div>
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export const ProjectNotFound = () => (
  <div className="h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="text-xl font-semibold text-gray-900 mb-2">
        Project Not Found
      </div>
      <div className="text-gray-500">
        The requested project could not be found.
      </div>
    </div>
  </div>
);