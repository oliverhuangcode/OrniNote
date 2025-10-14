import { useEffect, useState, useRef } from "react";
import { getAuthHeaders } from "../../../utils/apiHelper";

interface ShareProjectProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: "Owner" | "Editor" | "Viewer";
  color: string;
  initial: string;
  status: "Pending" | "Active";
}

type ShareRole = "Viewer" | "Editor";
const RoleOptions: ShareRole[] = ["Viewer", "Editor"];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export default function ShareProject({ isOpen, onClose, projectId, projectName}: ShareProjectProps) {
  const [email, setEmail] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeamMember[]>([]);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Fetches from backend when project changes 
  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }

        const data = await response.json();
        const project = data.project;
        
        // Fetch active collaborators
        const activeMembers = project.collaborators.map((c: any) => ({
          id: c.user._id,
          name: c.user.username,
          role: c.role,
          color: "#3A96FF", 
          initial: c.user.username.charAt(0).toUpperCase(),
          status: "Active" as const,
        }));

        // Fetch pending invites
        const pendingMembers = (project.invites || [])
          .filter((i: any) => i.status === "Pending")
          .map((invite: any) => ({
            id: invite._id,
            name: invite.email,
            role: invite.role || "Viewer",
            color: "#A0AEC0",
            initial: invite.email.charAt(0).toUpperCase(),
            status: "Pending" as const,
          }));
        
        setTeamMembers(activeMembers);
        setPendingInvites(pendingMembers);
      } catch (err) {
        console.error("Failed to fetch project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [isOpen, projectId]);

  const handleInvite = async () => {
    if (!email.trim()) return;

    try {
      setError(null);
      
      // Send invite request to backend
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

      if (result.success) {
        alert("Invitation sent!");

        // Add pending invite to UI
        setPendingInvites(prev => [
          ...prev,
          {
            id: result.inviteId || Date.now().toString(),
            name: email,
            role: "Viewer",
            color: "#A0AEC0",
            initial: email.charAt(0).toUpperCase(),
            status: "Pending"
          },
        ]);

        setEmail(""); // clear input
      } else {
        throw new Error(result.message || 'Failed to send invite');
      }
    } catch (err) {
      console.error("Error sending invite:", err);
      const errorMessage = err instanceof Error ? err.message : "Error sending invitation.";
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "Editor" | "Viewer") => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/collaborators/${memberId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to update role');
      }

      const result = await response.json();

      // Update UI
      if (result.success) {
        setTeamMembers(prev =>
          prev.map(member =>
            member.id === memberId ? { ...member, role: newRole } : member
          )
        );
      } else {
        throw new Error(result.message || result.error || 'Failed to update role');
      }
    } catch (err) {
      console.error("Error updating role:", err);
      const errorMessage = err instanceof Error ? err.message : "Error updating role";
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleCopyLink = async () => {
    try {
      const projectUrl = `${window.location.origin}/annotation/${projectId}`;
      await navigator.clipboard.writeText(projectUrl);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Failed to copy link to clipboard");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-lg relative shadow-2xl animate-scale-in"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-all duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-inter font-semibold text-xl text-gray-900">Share Project</h2>
              {projectName && (
                <p className="text-sm text-gray-500 font-inter">{projectName}</p>
              )}
            </div>
          </div>

          {/* Description + Copy Link Button */}
          <div className="flex items-start justify-between mb-6 mt-4">
            <p className="text-gray-600 font-inter text-sm flex-1">
              Invite teammates to collaborate in real-time
            </p>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-inter text-sm font-medium ml-4 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 13L16.5 6.5M16.5 6.5H13M16.5 6.5V10M10 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V15C3 15.5304 3.21071 16.0391 3.58579 16.4142C3.96086 16.7893 4.46957 17 5 17H15C15.5304 17 16.0391 16.7893 16.4142 16.4142C16.7893 16.0391 17 15.5304 17 15V10" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                />
              </svg>
              <span>{showCopySuccess ? "Copied!" : "Copy link"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 mb-6"></div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-inter">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mb-4 text-center text-gray-500 text-sm font-inter">
              Loading team members...
            </div>
          )}

          {/* Email Input */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                placeholder="teammate@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg font-inter text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleInvite}
              disabled={!email.trim() || loading}
              className="px-5 py-2.5 bg-green-600 text-white text-sm font-inter font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Invite
            </button>
          </div>

          {/* Team Members */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...teamMembers, ...pendingInvites].map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-2">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-inter font-semibold text-sm flex-shrink-0"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-inter text-sm text-gray-900 block truncate">{member.name}</span>
                  {member.status === "Pending" && (
                    <span className="text-xs text-gray-500 font-inter">Pending invitation</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {member.role === "Owner" || member.status === "Pending"? (
                    <span className="font-inter text-gray-600 text-sm font-medium">{member.role}</span>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdownId(openDropdownId === member.id ? null : member.id)
                        }
                        className="flex items-center justify-between px-3 py-1.5 gap-2 text-sm bg-white border border-gray-300 rounded-lg font-inter text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      >
                        <span>{member.role}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className={`transform transition-transform ${
                            openDropdownId === member.id ? "rotate-180" : ""
                          }`}
                        >
                          <path
                            d="M2 4L6 8L10 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {openDropdownId === member.id && (
                        <div className="absolute top-full right-0 mt-1 text-sm bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          {RoleOptions.map((role) => (
                            <button
                              key={role}
                              onClick={() => {
                                handleRoleChange(member.id, role as "Editor" | "Viewer");
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-2 text-left font-inter text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}