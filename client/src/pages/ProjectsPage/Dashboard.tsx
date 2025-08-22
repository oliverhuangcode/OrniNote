import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateProject from "../../components/modals/CreateProjectModal/CreateProject";

interface Project {
  id: string;
  name: string;
  lastEdited: string;
  thumbnail: string;
  collaborators?: { initial: string; color: string }[];
  isDeleted?: boolean;
  isShared?: boolean;
  sharedBy?: string;
}

const allProjects: Project[] = [
  // My Projects
  {
    id: "1",
    name: "Jinling White Duck",
    lastEdited: "Edited just now",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/87ad01551a1ce2d72bcf919f3ef50f7b767ba707?width=656",
    collaborators: [
      { initial: "B", color: "#E96DDF" },
      { initial: "C", color: "#5BABE9" }
    ]
  },
  {
    id: "2",
    name: "Cherry Valley Duckling",
    lastEdited: "Edited 2 hours ago",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/afbfe72ead185a64f360123390082b8d0a26c826?width=656"
  },
  {
    id: "3",
    name: "Seagull Behavior Study",
    lastEdited: "Edited 1 day ago",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/afbfe72ead185a64f360123390082b8d0a26c826?width=656"
  },

  // Shared Projects
  {
    id: "4",
    name: "Eagle Wingspan Analysis",
    lastEdited: "Edited 3 hours ago",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/afbfe72ead185a64f360123390082b8d0a26c826?width=656",
    isShared: true,
    sharedBy: "Dr. Sarah Johnson",
    collaborators: [
      { initial: "S", color: "#FF6B6B" },
      { initial: "M", color: "#4ECDC4" }
    ]
  },
  {
    id: "5",
    name: "Penguin Colony Tracking",
    lastEdited: "Edited 1 week ago",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/afbfe72ead185a64f360123390082b8d0a26c826?width=656",
    isShared: true,
    sharedBy: "Research Team Alpha"
  },

  // Deleted Projects
  {
    id: "6",
    name: "Old Bird Study",
    lastEdited: "Deleted 2 days ago",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/afbfe72ead185a64f360123390082b8d0a26c826?width=656",
    isDeleted: true
  },
  {
    id: "7",
    name: "Failed Annotation Test",
    lastEdited: "Deleted 1 week ago",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/afbfe72ead185a64f360123390082b8d0a26c826?width=656",
    isDeleted: true
  }
];

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

  const handleCreateProject = (projectData: any) => {
    console.log("Creating project:", projectData);
    // Handle project creation logic here
  };

  const handleDeleteProject = (projectId: string) => {
    console.log("Deleting project:", projectId);
    // In a real app, this would update the project status to deleted
  };

  const handleRestoreProject = (projectId: string) => {
    console.log("Restoring project:", projectId);
    // In a real app, this would restore the project from deleted
  };

  const handlePermanentDelete = (projectId: string) => {
    console.log("Permanently deleting project:", projectId);
    // In a real app, this would permanently remove the project
  };

  // Filter projects based on current view
  const getProjectsForView = () => {
    switch (currentView) {
      case "shared":
        return allProjects.filter(project => project.isShared && !project.isDeleted);
      case "deleted":
        return allProjects.filter(project => project.isDeleted);
      case "home":
      default:
        return allProjects.filter(project => !project.isShared && !project.isDeleted);
    }
  };

  // Apply search and sort filters
  const filteredProjects = getProjectsForView()
    .filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "Name":
          return a.name.localeCompare(b.name);
        case "Date Modified":
          return b.lastEdited.localeCompare(a.lastEdited);
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

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-300">
        {/* User Profile */}
        <div className="p-6 border-b border-gray-300">
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-ml-green rounded-full flex items-center justify-center">
                <span className="text-white font-inter font-medium text-xl">J</span>
              </div>
              <div className="flex-1">
                <h2 className="font-inter font-medium text-xl text-black">John Doe</h2>
              </div>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="hover:bg-gray-100 p-1 rounded transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-black">
                  <path d="M5.5 8.25L11 13.75L16.5 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-inter font-medium text-sm text-gray-900">John Doe</p>
                  <p className="font-inter text-xs text-gray-500">john.doe@email.com</p>
                </div>

                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter"
                  onClick={() => {
                    setShowUserDropdown(false);
                    console.log("Settings clicked");
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2573 9.77251 19.9887C9.5799 19.7201 9.31074 19.5176 9 19.41C8.69838 19.2769 8.36381 19.2372 8.03941 19.296C7.71502 19.3548 7.41568 19.5095 7.18 19.74L7.12 19.8C6.93425 19.986 6.71368 20.1335 6.47088 20.2341C6.22808 20.3348 5.96783 20.3866 5.705 20.3866C5.44217 20.3866 5.18192 20.3348 4.93912 20.2341C4.69632 20.1335 4.47575 19.986 4.29 19.8C4.10405 19.6143 3.95653 19.3937 3.85588 19.1509C3.75523 18.9081 3.70343 18.6478 3.70343 18.385C3.70343 18.1222 3.75523 17.8619 3.85588 17.6191C3.95653 17.3763 4.10405 17.1557 4.29 16.97L4.35 16.91C4.58054 16.6743 4.73519 16.375 4.794 16.0506C4.85282 15.7262 4.81312 15.3916 4.68 15.09C4.55324 14.7942 4.34276 14.542 4.07447 14.3643C3.80618 14.1866 3.49179 14.0913 3.17 14.09H3C2.46957 14.09 1.96086 13.8793 1.58579 13.5042C1.21071 13.1291 1 12.6204 1 12.09C1 11.5596 1.21071 11.0509 1.58579 10.6758C1.96086 10.3007 2.46957 10.09 3 10.09H3.09C3.42099 10.0823 3.74269 9.97512 4.01131 9.78251C4.27993 9.5899 4.48240 9.32074 4.59 9.01C4.72312 8.70838 4.76282 8.37381 4.704 8.04941C4.64519 7.72502 4.49054 7.42568 4.26 7.19L4.2 7.13C4.01405 6.94425 3.86653 6.72368 3.76588 6.48088C3.66523 6.23808 3.61343 5.97783 3.61343 5.715C3.61343 5.45217 3.66523 5.19192 3.76588 4.94912C3.86653 4.70632 4.01405 4.48575 4.2 4.3C4.38575 4.11405 4.60632 3.96653 4.84912 3.86588C5.09192 3.76523 5.35217 3.71343 5.615 3.71343C5.87783 3.71343 6.13808 3.76523 6.38088 3.86588C6.62368 3.96653 6.84425 4.11405 7.03 4.3L7.09 4.36C7.32568 4.59054 7.62502 4.73519 7.94941 4.794C8.27381 4.85282 8.60838 4.81312 8.91 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Settings
                </button>

                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter"
                  onClick={() => {
                    setShowUserDropdown(false);
                    console.log("Help clicked");
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Help & Support
                </button>

                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-inter"
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate("/");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
              className="w-full bg-gray-200 rounded-lg px-4 py-3 pl-12 font-inter text-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ml-green"
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
                className="flex items-center gap-2 bg-ml-green text-white px-6 py-2 rounded-lg font-inter font-medium hover:bg-opacity-90 transition-colors"
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
                onClick={() => setShowSortDropdown(!showSortDropdown)}
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
                        sortBy === option ? "bg-ml-green bg-opacity-10 text-ml-green" : "text-gray-700"
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

        {/* Project Gallery */}
        <div className="p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 text-gray-300">
                <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="font-inter text-lg text-gray-500 mb-2">
                {currentView === "shared" && "No shared projects"}
                {currentView === "deleted" && "No deleted projects"}
                {currentView === "home" && searchQuery && "No projects found"}
                {currentView === "home" && !searchQuery && "No projects yet"}
              </h3>
              <p className="font-inter text-sm text-gray-400">
                {currentView === "shared" && "Projects shared with you will appear here"}
                {currentView === "deleted" && "Deleted projects will appear here"}
                {currentView === "home" && searchQuery && `Try searching for something else`}
                {currentView === "home" && !searchQuery && "Create your first project to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="group relative">
                  <div className="bg-white border border-gray-300 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Thumbnail */}
                    <div className="aspect-[328/203] overflow-hidden relative">
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
                          project.isDeleted ? "opacity-50" : ""
                        }`}
                      />
                      {project.isDeleted && (
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <span className="text-white font-inter font-bold">DELETED</span>
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="p-5 relative">
                      <h3 className="font-inter text-base text-gray-500 mb-1">{project.name}</h3>
                      <p className="font-inter text-xs text-gray-400">{project.lastEdited}</p>

                      {/* Shared indicator */}
                      {project.isShared && project.sharedBy && (
                        <p className="font-inter text-xs text-blue-500 mt-1">Shared by {project.sharedBy}</p>
                      )}

                      {/* Collaborators */}
                      {project.collaborators && (
                        <div className="absolute right-5 top-5 flex -space-x-2">
                          {project.collaborators.map((collaborator, index) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-inter text-sm border-2 border-white"
                              style={{ backgroundColor: collaborator.color }}
                            >
                              {collaborator.initial}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentView === "deleted" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreProject(project.id);
                            }}
                            className="px-3 py-1 bg-ml-green text-white text-xs rounded hover:bg-opacity-80 transition-colors"
                          >
                            Restore
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePermanentDelete(project.id);
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-opacity-80 transition-colors"
                          >
                            Delete Forever
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Link
                            to={`/annotation/${project.id}`}
                            className="px-3 py-1 bg-ml-green text-white text-xs rounded hover:bg-opacity-80 transition-colors"
                          >
                            Open
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-opacity-80 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
