import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, Share2, Trash2, Plus, ChevronDown } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  lastEdited: string;
  thumbnail: string;
  collaborators?: Array<{
    id: string;
    name: string;
    avatar: string;
    color: string;
  }>;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Jinling White Duck',
    lastEdited: 'Edited just now',
    thumbnail: 'https://api.builder.io/api/v1/image/assets/TEMP/87ad01551a1ce2d72bcf919f3ef50f7b767ba707?width=656',
    collaborators: [
      { id: '1', name: 'B', avatar: 'B', color: '#E96DDF' },
      { id: '2', name: 'C', avatar: 'C', color: '#5BABE9' }
    ]
  },
  {
    id: '2',
    name: 'Cherry Valley Duckling',
    lastEdited: 'Edited 2 hours ago',
    thumbnail: 'https://api.builder.io/api/v1/image/assets/TEMP/afbfe72ead185a64f360123390082b8d0a26c826?width=656'
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `${i + 3}`,
    name: 'Project Name',
    lastEdited: 'Edited [time] ago',
    thumbnail: 'https://api.builder.io/api/v1/image/assets/TEMP/afbfe72ead185a64f360123390082b8d0a26c826?width=656'
  }))
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('Recent');

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-[348px] bg-white border-r border-brand-gray-400 flex flex-col">
        {/* User Profile */}
        <div className="p-6 border-b border-brand-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-green flex items-center justify-center">
              <span className="text-white font-semibold text-xl">J</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg text-brand-gray-700">John Doe</h3>
            </div>
            <ChevronDown className="w-5 h-5 text-brand-gray-700" />
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-brand-gray-400">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-brand-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-lg bg-brand-gray-200 text-lg placeholder-brand-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className="bg-brand-gray-200 h-11 flex items-center">
            <div className="w-full"></div>
          </div>
          
          <div className="px-6 py-4 space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-brand-gray-100 text-brand-gray-700"
            >
              <Home className="w-6 h-6" />
              <span className="text-base">Home</span>
            </Link>
            
            <Link
              to="/shared"
              className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-brand-gray-100 text-brand-gray-700"
            >
              <Share2 className="w-6 h-6" />
              <span className="text-base">Shared with you</span>
            </Link>
            
            <Link
              to="/deleted"
              className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-brand-gray-100 text-brand-gray-700"
            >
              <Trash2 className="w-6 h-6" />
              <span className="text-base">Deleted</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-18 border-b border-brand-gray-400 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-black">Recents</h1>
          </div>
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-6 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {/* Sort Controls */}
        <div className="px-6 py-4 border-b border-brand-gray-400">
          <div className="flex items-center gap-4">
            <span className="text-lg text-brand-gray-500">Sort</span>
            <div className="flex items-center gap-2">
              <span className="text-lg text-black">{sortBy}</span>
              <ChevronDown className="w-5 h-5 text-brand-gray-700" />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-3 gap-6">
            {mockProjects.map((project) => (
              <Link
                key={project.id}
                to={`/annotation/${project.id}`}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-2xl border border-brand-gray-300 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  <div className="aspect-[328/203] relative">
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-5 h-[68px] flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-base text-brand-gray-500 font-normal mb-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {project.lastEdited}
                      </p>
                    </div>
                    
                    {/* Collaborators */}
                    {project.collaborators && (
                      <div className="flex -space-x-1">
                        {project.collaborators.map((collaborator) => (
                          <div
                            key={collaborator.id}
                            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-normal"
                            style={{ backgroundColor: collaborator.color }}
                          >
                            {collaborator.avatar}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-brand-gray-600 mb-6">New Project</h2>
            <div className="text-center py-16 border-2 border-dashed border-brand-gray-500 rounded-2xl mb-8">
              <div className="text-brand-gray-900 text-lg font-bold mb-2">Choose a file</div>
              <div className="text-brand-gray-900 text-lg">or drag it here</div>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full py-3 bg-brand-green text-white rounded-lg font-bold hover:bg-brand-green-dark transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
