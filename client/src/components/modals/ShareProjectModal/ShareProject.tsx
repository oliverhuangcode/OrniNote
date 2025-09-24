import { useEffect, useState } from "react";

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

export default function ShareProject({ isOpen, onClose, projectId, projectName}: ShareProjectProps) {
  const [email, setEmail] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeamMember[]>([]);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Fetches from backend when project changes 
  useEffect(() => {
    if (!isOpen) return;


    fetch(`/api/project/${projectId}`)  
      .then(res => res.json())
      .then(data => {
        
        // Fetch active collaborators
        const activeMembers = data.collaborators.map((c: any) => ({
          id: c.user._id,
          name: c.user.username,
          role: c.role,
          color: "#3A96FF", 
          initial: c.user.username.charAt(0).toUpperCase(),
          status: "Active",
        }));

        // Fetch pending invites
        const pendingMembers = (data.invites || []).filter((i: any) => i.status === "Pending").map((invite: any) => ({
          id: invite._id,
          name: invite.email,
          role: invite.role || "Viewer",
          color: "#A0AEC0",
          initial: invite.email.charAt(0).toUpperCase(),
          status: "Pending",
        }));
        
        setTeamMembers(activeMembers);
        setPendingInvites(pendingMembers);
      })
      .catch(err => console.error("Failed to fetch project:", err));
  }, [isOpen, projectId]);

  const handleInvite = async () => {
    if (!email.trim()) return;

    try {
      // Send invite request to backend
      const response = await fetch('/api/invite', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          projectId,
          projectName
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Invitation sent!");

        // Add pending invite to UI
        setPendingInvites(prev => [
          ...prev,
          {
            id: result.inviteId,
            name: email,
            role: "Viewer",
            color: "#A0AEC0", // gray for pending members
            initial: email.charAt(0).toUpperCase(),
            status: "Pending"
          },
        ]);

        setEmail(""); // clear input
      } else {
        alert("Failed to send invite: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending invitation.");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "Editor" | "Viewer") => {
    try {
      const response = await fetch(`/api/project/${projectId}/collaborators/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      // Update UI
      if (result.success){
        setTeamMembers(prev =>
          prev.map(member =>
            member.id === memberId ? { ...member, role: newRole } : member
          )
        );
      } else {
        alert("Failed to update role: " + (result.message || result.error));
      }
    } catch (err) {
      console.error(err);
      alert("Error updating role");
    }
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
      <div className="bg-white rounded-2xl w-full max-w-lg relative shadow-xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-black rounded p-1 bg-transparent hover:bg-gray-200 transition-colors"
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M21 9.5V7.5C21 6.39543 20.1046 5.5 19 5.5H5C3.89543 5.5 3 6.39543 3 7.5V16.5C3 17.6046 3.89543 18.5 5 18.5H13M16 14L18 16L22 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="font-inter font-semibold text-xl text-black">Share {projectName}</h2>
        </div>

        {/* Description + Copy Link Button */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-500 font-inter text-sm">
            Invite your teammates to collaborate in real-time
          </p>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-inter text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 13L16.5 6.5M16.5 6.5H13M16.5 6.5V10M10 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V15C3 15.5304 3.21071 16.0391 3.58579 16.4142C3.96086 16.7893 4.46957 17 5 17H15C15.5304 17 16.0391 16.7893 16.4142 16.4142C16.7893 16.0391 17 15.5304 17 15V10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              />
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
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-inter text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-green focus:border-transparent shadow-sm"
            />
          </div>
          <button
            onClick={handleInvite}
            className="px-5 py-2 bg-ml-green text-white text-sm font-inter rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Invite
          </button>
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          {[...teamMembers, ...pendingInvites].map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-inter font-medium"
                style={{ backgroundColor: member.color }}
              >
                {member.initial}
              </div>
              <div className="flex-1">
                <span className="font-inter text-sm text-black">{member.name}</span>
                {member.status === "Pending" && (
                  <span className="text-xs text-gray-500 ml-2">Pending</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {member.role === "Owner" ? (
                  <span className="font-inter text-gray-500 text-sm">{member.role}</span>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdownId(openDropdownId === member.id ? null : member.id)
                      }
                      className="w-fit flex items-center justify-between px-4 py-2 gap-2 text-sm bg-white border border-gray-300 rounded-lg font-inter text-gray-600 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-green"
                    >
                      <span>{member.role}</span>
                      <svg
                        width="12"
                        height="7"
                        viewBox="0 0 12 7"
                        fill="none"
                        className={`transform transition-transform ${
                          openDropdownId === member.id ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M1.13623 1.51208L5.79532 6.20066L10.4544 1.51208"
                          stroke="black"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {openDropdownId === member.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 text-sm bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        {RoleOptions.map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              handleRoleChange(member.id, role as "Editor" | "Viewer");
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-3 text-left font-inter text-gray-800 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
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
  );
}
