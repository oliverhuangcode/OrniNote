import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateProject from "../../components/modals/CreateProjectModal/CreateProject";
import { projectService, Project as BackendProject } from "../../services/projectService";
import { useAuth } from "../../contexts/authContext";
import { getAuthHeaders } from "../../utils/apiHelper";

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
  inviteEmails?: string[]; // Team member emails to invite after project creation
  additionalImages?: Array<{
    imageUrl: string;
    imageFilename: string;
    imageWidth: number;
    imageHeight: number;
  }>;
}

type ViewType = "home" | "shared" | "deleted";
type SortType = "Recent" | "Name" | "Date Modified";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("Recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Add sort order state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Project data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserDropdown(false);
      setShowSortDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, currentView]);

  if (!user) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user?.username) return 'U';
    
    const name = user.username.trim();
    const parts = name.split(' ');
    
    if (parts.length >= 2) {
      // Get first letter of first two words
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    // Get first two letters of single word
    return name.substring(0, 2).toUpperCase();
  };

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      let backendProjects;
      
      if (currentView === 'deleted') {
        backendProjects = await projectService.getDeletedProjects(user._id);
      } else if (currentView === 'shared') {
        backendProjects = await projectService.getSharedProjects(user._id);
      } else {
        backendProjects = await projectService.getUserProjects(user._id);
        // Filter to only owned projects
        backendProjects = backendProjects.filter(p => p.owner._id === user._id);
      }
      
      const formattedProjects = backendProjects.map(project => {
        const formatted = projectService.convertToCardFormat(project);
        
        if (currentView === 'shared') {
          return {
            ...formatted,
            isShared: true,
            sharedBy: project.owner.username
          };
        }
        
        return formatted;
      });
      
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Send invites after project is created
  const sendInvites = async (projectId: string, projectName: string, inviteEmails: string[]) => {
    if (!inviteEmails || inviteEmails.length === 0) return;

    console.log(`Sending ${inviteEmails.length} invitations for project: ${projectName}`);
    
    const invitePromises = inviteEmails.map(async (email) => {
      try {
        const response = await fetch(`${API_BASE_URL}/invite`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            email,
            projectId,
            projectName
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send invite');
        }

        const result = await response.json();
        console.log(`Invite sent successfully to ${email}`);
        return { success: true, email };
      } catch (err) {
        console.error(`Failed to invite ${email}:`, err);
        return { success: false, email, error: err };
      }
    });

    const results = await Promise.all(invitePromises);
    const failed = results.filter(r => !r.success);
    const succeeded = results.filter(r => r.success);
    
    // Only alert if there were failures
    if (failed.length > 0 && succeeded.length > 0) {
      alert(`${succeeded.length} invitation(s) sent, but ${failed.length} failed. You can resend them from the Share menu.`);
    } else if (failed.length === inviteEmails.length) {
      alert(`Failed to send all ${failed.length} invitation(s). You can send them from the Share menu.`);
    }
    // Silent success - no alert if all invites succeeded
  };

  const handleCreateProject = async (projectData: ProjectData) => {
    if (!user) {
      alert('You must be logged in to create a project');
      return;
    }

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
        ownerId: user._id
      };

      // Create project in backend (MongoDB) with the first image
      const newProject = await projectService.createProject(backendProjectData);
      
      console.log('Project created successfully:', newProject);
      
      // If there are additional images, batch add them
      if (projectData.additionalImages && projectData.additionalImages.length > 0) {
        console.log(`Adding ${projectData.additionalImages.length} additional images...`);
        await projectService.batchAddImagesToProject(
          newProject._id, 
          projectData.additionalImages
        );
        
        // Reload the project to get updated data with all images
        const updatedProject = await projectService.getProject(newProject._id);
        
        // Convert to dashboard format and add to local state
        const formattedProject = projectService.convertToCardFormat(updatedProject);
        setProjects(prev => [formattedProject, ...prev]);
        
        console.log('Additional images added successfully');
      } else {
        // No additional images, just use the newly created project
        const formattedProject = projectService.convertToCardFormat(newProject);
        setProjects(prev => [formattedProject, ...prev]);
      }

      // Send invites if there are any team members to invite
      if (projectData.inviteEmails && projectData.inviteEmails.length > 0) {
        await sendInvites(newProject._id, projectData.name, projectData.inviteEmails);
      }
      
      // Navigate to annotation page
      navigate(`/annotation/${newProject._id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      alert(err instanceof Error ? err.message : 'Failed to create project');
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
      console.log('Attempting to restore project:', projectId);
      
      // Call backend API to restore project
      await projectService.restoreProject(projectId);
      
      console.log('Restore API call successful');
      
      // Reload projects to refresh the view
      await loadProjects();
      
      console.log("Project restored successfully:", projectId);
    } catch (err) {
      console.error('Failed to restore project:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore project');
    }
  };

  const handlePermanentDelete = async (projectId: string) => {
    try {
      console.log('Attempting to permanently delete project:', projectId);
      
      // Call backend API to permanently delete project
      await projectService.permanentlyDeleteProject(projectId);
      
      console.log('Permanent delete API call successful');
      
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
      let comparison = 0;
      
      switch (sortBy) {
        case "Name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "Date Modified":
        case "Recent":
          // Extract timestamps from lastEdited string or use current time as fallback
          const getTimestamp = (lastEdited: string) => {
            // Try to parse "Edited X ago" format
            const now = Date.now();
            if (lastEdited.includes('just now')) return now;
            if (lastEdited.includes('minute')) {
              const mins = parseInt(lastEdited.match(/\d+/)?.[0] || '0');
              return now - (mins * 60 * 1000);
            }
            if (lastEdited.includes('hour')) {
              const hours = parseInt(lastEdited.match(/\d+/)?.[0] || '0');
              return now - (hours * 60 * 60 * 1000);
            }
            if (lastEdited.includes('day')) {
              const days = parseInt(lastEdited.match(/\d+/)?.[0] || '0');
              return now - (days * 24 * 60 * 60 * 1000);
            }
            if (lastEdited.includes('week')) {
              const weeks = parseInt(lastEdited.match(/\d+/)?.[0] || '0');
              return now - (weeks * 7 * 24 * 60 * 60 * 1000);
            }
            if (lastEdited.includes('month')) {
              const months = parseInt(lastEdited.match(/\d+/)?.[0] || '0');
              return now - (months * 30 * 24 * 60 * 60 * 1000);
            }
            return now; // Default to now if can't parse
          };
          
          const timeA = getTimestamp(a.lastEdited);
          const timeB = getTimestamp(b.lastEdited);
          comparison = timeB - timeA; // Most recent first by default
          break;
        default:
          return 0;
      }
      
      // Apply sort order
      return sortOrder === "asc" ? comparison : -comparison;
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
              <h3 className="font-semibold text-gray-900 text-base truncate pr-2 hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
            </Link>
            {project.collaborators && project.collaborators.length > 0 && (
            <div className="flex -space-x-1">
              {project.collaborators.map((collaborator, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white"
                  style={{ backgroundColor: collaborator.color }}
                  title={collaborator.initial} // Shows full name on hover
                >
                  {collaborator.initial.substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          )}
          </div>
          <p className="text-gray-500 text-xs">
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
                {getUserInitials()}
              </div>
              <div className="text-left flex-1">
                <p className="font-inter font-medium text-black">{user.username}</p>
                <p className="font-inter text-sm text-gray-500">{user.email}</p>
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
                      signout();
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
              className="w-full bg-gray-100 rounded-lg px-4 py-2.5 pl-10 font-inter text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <path d="M17.5 17.5L14.5834 14.5834M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-inter text-sm font-medium text-gray-900">Home</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("shared")}
            className={`w-full px-6 py-3 ${currentView === "shared" ? "bg-gray-200" : "hover:bg-gray-100"} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-inter text-sm font-medium text-gray-900">Shared with you</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("deleted")}
            className={`w-full px-6 py-3 ${currentView === "deleted" ? "bg-gray-200" : "hover:bg-gray-100"} transition-colors`}
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                <path d="M3 6H5M5 6H21M5 6V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M10 11V17M14 11V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-inter text-sm font-medium text-gray-900">Deleted</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="border-b border-gray-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-inter font-semibold text-xl text-gray-900">{getViewTitle()}</h1>
            {currentView !== "deleted" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg font-inter font-medium text-sm hover:bg-green-700 transition-colors shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create
              </button>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <span className="font-inter text-sm font-medium text-gray-500">Sort by</span>
            <div className="flex items-center gap-2">
              {/* Sort Type Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortDropdown(!showSortDropdown);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-inter text-sm font-medium text-gray-900">{sortBy}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-500">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Sort Dropdown */}
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {(["Recent", "Name", "Date Modified"] as SortType[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left font-inter text-sm transition-colors ${
                          sortBy === option 
                            ? "bg-green-50 text-green-700 font-medium" 
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ascending/Descending Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "desc" ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-gray-700">
                    <path d="M9 3.75V14.25M9 14.25L13.5 9.75M9 14.25L4.5 9.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-gray-700">
                    <path d="M9 14.25V3.75M9 3.75L4.5 8.25M9 3.75L13.5 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
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
              <div className="text-gray-500 text-sm mb-4">
                {searchQuery ? "No projects found matching your search." : "No projects yet."}
              </div>
              {!searchQuery && currentView === "home" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-200 shadow-sm"
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