import { useState } from "react";

interface ShareProjectProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: "Owner" | "Editor" | "Viewer";
  color: string;
  initial: string;
}

const initialTeamMembers: TeamMember[] = [
  { id: "1", name: "John Doe", role: "Owner", color: "#6ED875", initial: "J" },
  { id: "2", name: "Jane Doe", role: "Editor", color: "#3A96FF", initial: "J" },
  { id: "3", name: "Joe Doe", role: "Viewer", color: "#F39A4D", initial: "J" },
];

export default function ShareProject({ isOpen, onClose, projectName = "Project" }: ShareProjectProps) {
  const [email, setEmail] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleInvite = () => {
    if (email.trim()) {
      console.log("Inviting:", email);
      setEmail("");
    }
  };

  const handleRoleChange = (memberId: string, newRole: "Editor" | "Viewer") => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-black hover:text-gray-600"
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M19.5 6.5L6.5 19.5M6.5 6.5L19.5 19.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M21 9.5V7.5C21 6.39543 20.1046 5.5 19 5.5H5C3.89543 5.5 3 6.39543 3 7.5V16.5C3 17.6046 3.89543 18.5 5 18.5H13M16 14L18 16L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-inter font-bold text-2xl text-black">Share {projectName}</h2>
        </div>

        {/* Description */}
        <p className="text-gray-500 font-inter text-base mb-6">
          Share this project with your teammates for real-time collaboration
        </p>

        {/* Copy Link Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-inter"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 13L16.5 6.5M16.5 6.5H13M16.5 6.5V10M10 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V15C3 15.5304 3.21071 16.0391 3.58579 16.4142C3.96086 16.7893 4.46957 17 5 17H15C15.5304 17 16.0391 16.7893 16.4142 16.4142C16.7893 16.0391 17 15.5304 17 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{showCopySuccess ? "Copied!" : "Copy link"}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-300 mb-6"></div>

        {/* Email Input */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-inter text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-green focus:border-transparent shadow-sm"
            />
          </div>
          <button
            onClick={handleInvite}
            className="px-6 py-3 bg-ml-green text-white font-inter rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
          >
            Invite
          </button>
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-inter font-medium"
                style={{ backgroundColor: member.color }}
              >
                {member.initial}
              </div>
              <div className="flex-1">
                <span className="font-inter text-base text-black">{member.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {member.role === "Owner" ? (
                  <span className="text-gray-500 font-inter">{member.role}</span>
                ) : (
                  <div className="relative">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as "Editor" | "Viewer")}
                      className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 font-inter text-black focus:outline-none focus:ring-2 focus:ring-ml-green pr-8"
                    >
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                        <path d="M1.13623 1.12451L5.79532 5.77849L10.4544 1.12451" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
