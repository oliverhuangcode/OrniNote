// client/src/pages/ProjectsPage/Dashboard.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateProject from "../../components/modals/CreateProjectModal/CreateProject";
import { projectService, Project as BackendProject } from "../../services/projectService";

interface Project {
  id: string;
  name: string;
  lastEdited: string;
  thumbnail: string;
  collaborators?: { initial: string; color: string }[];
  isShared?: boolean;
  sharedBy?: string;
  deletedAt?: string | null;
}

interface ProjectData {
  name: string;
  width: number;
  height: number;
  imageUrl?: string;
  imageFilename?: string;
  teamMembers: string[];
}

type ViewType = "home" | "shared" | "deleted";
type SortType = "Recent" | "Name" | "Date Modified";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("Recent");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Project data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: UPDATE FOR USER AUTH
  const CURRENT_USER_ID = "68ceb5ef7fdc767b16f6fc1d"; 

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserDropdown(false);
      setShowSortDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Load projects from backend
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const backendProjects = await projectService.getUserProjects(CURRENT_USER_ID);
      
      // Convert backend projects to dashboard card format
      const formattedProjects = backendProjects.map(project => 
        projectService.convertToCardFormat(project)
      );
      
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: ProjectData) => {
    try {
      if (!projectData.imageUrl) {
        throw new Error('Image URL is required');
      }

      // Prepare data for backend
      const backendProjectData = {
        name: projectData.name,
        description: '', 
        imageUrl: projectData.imageUrl,
        imageFilename: projectData.imageFilename || 'uploaded-image.jpg',
        imageWidth: projectData.width,
        imageHeight: projectData.height,
        ownerId: CURRENT_USER_ID
      };

      // Create project in backend
      const newProject = await projectService.createProject(backendProjectData);
      
      // Convert to dashboard format and add to local state
      const formattedProject = projectService.convertToCardFormat(newProject);
      setProjects(prev => [formattedProject, ...prev]);

      console.log('Project created successfully:', newProject);

      navigate(`/annotation/${newProject._id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      console.log('Attempting to delete project:', projectId);
      
      // Call backend API to delete project
      await projectService.deleteProject(projectId);
      
      console.log('Delete API call successful');
      
      setProjects(prev => 
        prev.map(p => 
          p.id === projectId
            ? { ...p, deletedAt: new Date().toISOString(), lastEdited: "Deleted just now" }
            : p
        )
      );
      
      console.log("Project deleted successfully:", projectId);
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleRestoreProject = async (projectId: string) => {
    try {
      // Update local state
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, deletedAt: null, lastEdited: "Restored just now" }
            : p
        )
      );
      
      console.log("Project restored successfully:", projectId);
    } catch (err) {
      console.error('Failed to restore project:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore project');
    }
  };

  const handlePermanentDelete = async (projectId: string) => {
    try {
      // Remove from local state entirely
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      console.log("Project permanently deleted:", projectId);
    } catch (err) {
      console.error('Failed to permanently delete project:', err);
      setError(err instanceof Error ? err.message : 'Failed to permanently delete project');
    }
  };

  // Filter projects based on current view
  const getProjectsForView = () => {
    switch (currentView) {
      case "shared":
        return projects.filter(project => project.isShared && !project.deletedAt);
      case "deleted":
        return projects.filter(project => project.deletedAt);
      case "home":
      default:
        return projects.filter(project => !project.isShared && !project.deletedAt);
    }
  };

  const filteredProjects = getProjectsForView()
    .filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "Name":
          return a.name.localeCompare(b.name);
        case "Date Modified":
          // Parse the lastEdited strings to compare properly
          const timeA = new Date(a.lastEdited.replace('Edited ', '').replace(' ago', '')).getTime() || 0;
          const timeB = new Date(b.lastEdited.replace('Edited ', '').replace(' ago', '')).getTime() || 0;
          return timeB - timeA; // Most recent first
        case "Recent":
        default:
          return 0; // Keep original order for recent
      }
    });

  const getViewTitle = () => {
    switch (currentView) {
      case "shared":
        return "Shared with you";
      case "deleted":
        return "Deleted";
      case "home":
      default:
        return "Recents";
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group relative">
        <Link to={`/annotation/${project.id}`} className="block">
          <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
            <img
              src={project.thumbnail}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/656x400?text=No+Image';
              }}
            />
            
            {/* Three Dots Menu */}
            <div className="absolute top-2 right-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="3" cy="8" r="1" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1" fill="currentColor"/>
                  <circle cx="13" cy="8" r="1" fill="currentColor"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {project.deletedAt ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRestoreProject(project.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Restore
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePermanentDelete(project.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M10 6L6 10M6 6L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Delete Forever
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/annotation/${project.id}`}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2L14 8L8 14M14 8H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Open
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Copy project link
                          navigator.clipboard.writeText(`${window.location.origin}/annotation/${project.id}`);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.5 10.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 2.5H13.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 8L13.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Copy Link
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 4H14M12.5 4V13C12.5 13.5523 12.0523 14 11.5 14H4.5C3.94772 14 3.5 13.5523 3.5 13V4M5.5 4V2.5C5.5 1.94772 5.94772 1.5 6.5 1.5H9.5C10.0523 1.5 10.5 1.94772 10.5 2.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Link to={`/annotation/${project.id}`}>
              <h3 className="font-semibold text-gray-900 text-lg truncate pr-2 hover:text-blue-600">
                {project.name}
              </h3>
            </Link>
            {project.collaborators && project.collaborators.length > 0 && (
              <div className="flex -space-x-1">
                {project.collaborators.map((collaborator, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    {collaborator.initial}
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {project.isShared && project.sharedBy ? `Shared by ${project.sharedBy}` : project.lastEdited}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        {/* User Profile */}
        <div className="p-6 border-b border-gray-300">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserDropdown(!showUserDropdown);
              }}
              className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div className="text-left flex-1">
                <p className="font-inter font-medium text-black">User</p>
                <p className="font-inter text-sm text-gray-500">user@example.com</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter">
                  Profile Settings
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter">
                  Help & Support
                </button>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-inter"
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate("/login");
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-300">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-200 rounded-lg px-4 py-3 pl-12 font-inter text-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <path d="M22.75 22.75L18.0375 18.0375M20.5833 11.9167C20.5833 16.7031 16.7031 20.5833 11.9167 20.5833C7.1302 20.5833 3.25 16.7031 3.25 11.9167C3.25 7.1302 7.1302 3.25 11.9167 3.25C16.7031 3.25 20.5833 7.1302 20.5833 11.9167Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          <button
            onClick={() => setCurrentView("home")}
            className={`w-full px-6 py-3 ${currentView === "home" ? "bg-gray-200" : "hover:bg-gray-100"} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-inter text-base text-black">Home</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("shared")}
            className={`w-full px-6 py-3 ${currentView === "shared" ? "bg-gray-200" : "hover:bg-gray-100"} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-inter text-base text-black">Shared with you</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("deleted")}
            className={`w-full px-6 py-3 ${currentView === "deleted" ? "bg-gray-200" : "hover:bg-gray-100"} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                <path d="M3 6H5M5 6H21M5 6V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M10 11V17M14 11V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-inter text-base text-black">Deleted</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="border-b border-gray-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-inter font-medium text-2xl text-black">{getViewTitle()}</h1>
            {currentView !== "deleted" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-inter font-medium hover:bg-green-700 transition-colors"
              >
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path d="M8.50008 3.54169V13.4584M3.54175 8.50002H13.4584" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create
              </button>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-6">
            <span className="font-inter text-xl text-gray-500">Sort</span>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(!showSortDropdown);
                }}
                className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
              >
                <span className="font-inter text-xl text-black">{sortBy}</span>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-black">
                  <path d="M5.5 8.25L11 13.75L16.5 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Sort Dropdown */}
              {showSortDropdown && (
                <div className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {(["Recent", "Name", "Date Modified"] as SortType[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left font-inter text-base hover:bg-gray-50 ${
                        sortBy === option ? "bg-green-50 text-green-600" : "text-gray-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              <div className="w-8 h-px bg-gray-500 mx-2"></div>
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" className="text-black">
                <path d="M9.49992 3.95831V15.0416M9.49992 15.0416L15.0416 9.49998M9.49992 15.0416L3.95825 9.49998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
            <button
              onClick={loadProjects}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Project Gallery */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading projects...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchQuery ? "No projects found matching your search." : "No projects yet."}
              </div>
              {!searchQuery && currentView === "home" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200"
                >
                  Create your first project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProject
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}