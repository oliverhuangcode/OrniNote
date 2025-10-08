import { useEffect, useState } from "react";
import { projectService } from "../../../services/projectService";
import { Project as BackendProject } from "../../../services/projectService";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  lastEdited: string;
  thumbnail: string;
}

interface OpenCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export default function OpenCommandModal({ isOpen, onClose, currentUserId }: OpenCommandModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) loadProjects();
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      const backendProjects = await projectService.getUserProjects(currentUserId);
      
      // Convert backend projects to dashboard card format
      const formattedProjects = backendProjects.map(project => 
        projectService.convertToCardFormat(project)
      );
      
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[80vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Open a project</h2>

          {/* Close button */}
          <button 
            onClick={onClose} 
            className="text-black rounded p-1 bg-transparent hover:bg-gray-200 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                <path d="M19.5 6.5L6.5 19.5M6.5 6.5L19.5 19.5" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                />
            </svg>
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-gray-500 text-center py-6">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500 text-center py-6">No projects found</div>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/annotation/${project.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition"
                >
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-20 h-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/160x120?text=No+Image";
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-black">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.lastEdited}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}