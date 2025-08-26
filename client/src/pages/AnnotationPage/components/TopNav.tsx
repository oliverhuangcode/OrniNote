import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActiveFile } from "../types";
import FileTabs from "./FileTabs";

interface TopNavProps {
  projectId: string | undefined;
  activeFiles: ActiveFile[];
  showShareModal: boolean;
  showExportModal: boolean;
  showUserDropdown: boolean;
  showFileMenu: boolean;
  showEditMenu: boolean;
  showViewMenu: boolean;
  onSwitchFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
  onShowShareModal: () => void;
  onShowExportModal: () => void;
  onToggleUserDropdown: () => void;
  onToggleFileMenu: () => void;
  onToggleEditMenu: () => void;
  onToggleViewMenu: () => void;
  onCanvasZoom: (direction: "in" | "out" | "reset") => void;
}

export default function TopNav({
  projectId,
  activeFiles,
  showShareModal,
  showExportModal,
  showUserDropdown,
  showFileMenu,
  showEditMenu,
  showViewMenu,
  onSwitchFile,
  onCloseFile,
  onShowShareModal,
  onShowExportModal,
  onToggleUserDropdown,
  onToggleFileMenu,
  onToggleEditMenu,
  onToggleViewMenu,
  onCanvasZoom,
}: TopNavProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-300">
      {/* Logo */}
      <div className="h-28 flex items-center px-4">
        <Link
          to="/dashboard"
          className="w-16 h-16 bg-ml-green rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors cursor-pointer"
        >
          <span className="font-inter font-bold text-xs text-white">ML Tool</span>
        </Link>
      </div>

      {/* Menu Bar */}
      <div className="flex items-center gap-10 px-4 py-4 border-b border-gray-300 bg-white relative">
        {/* File Menu */}
        <div className="relative">
          <button
            className="font-inter text-base text-black hover:text-ml-green transition-colors"
            onClick={onToggleFileMenu}
          >
            File
          </button>
          {showFileMenu && (
            <div className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleFileMenu(); console.log("New Project")}}>New Project</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleFileMenu(); console.log("Open")}}>Open</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleFileMenu(); console.log("Save")}}>Save</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleFileMenu(); onShowExportModal()}}>Export...</button>
              <div className="border-t border-gray-100 my-1"></div>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleFileMenu(); navigate("/dashboard")}}>Close Project</button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            className="font-inter text-base text-black hover:text-ml-green transition-colors"
            onClick={onToggleEditMenu}
          >
            Edit
          </button>
          {showEditMenu && (
            <div className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleEditMenu(); console.log("Undo")}}>Undo</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleEditMenu(); console.log("Redo")}}>Redo</button>
              <div className="border-t border-gray-100 my-1"></div>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleEditMenu(); console.log("Cut")}}>Cut</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleEditMenu(); console.log("Copy")}}>Copy</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleEditMenu(); console.log("Paste")}}>Paste</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleEditMenu(); console.log("Delete")}}>Delete</button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            className="font-inter text-base text-black hover:text-ml-green transition-colors"
            onClick={onToggleViewMenu}
          >
            View
          </button>
          {showViewMenu && (
            <div className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleViewMenu(); onCanvasZoom("in")}}>Zoom In</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleViewMenu(); onCanvasZoom("out")}}>Zoom Out</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleViewMenu(); onCanvasZoom("reset")}}>Actual Size</button>
              <div className="border-t border-gray-100 my-1"></div>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleViewMenu(); console.log("Show Grid")}}>Show Grid</button>
              <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleViewMenu(); console.log("Show Rulers")}}>Show Rulers</button>
            </div>
          )}
        </div>

        <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Annotation menu")}>Annotation</button>
        <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Layers menu")}>Layers</button>
        <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Tools menu")}>Tools</button>
        <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={onShowShareModal}>Collaboration</button>
        <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Settings menu")}>Settings</button>
        <button className="font-inter text-base text-black hover:text-ml-green transition-colors" onClick={() => console.log("Help menu")}>Help</button>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <nav className="flex items-center space-x-2 text-sm font-inter">
          <Link to="/dashboard" className="text-ml-green hover:text-ml-green/80 transition-colors">
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Projects</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Duck Annotation #{projectId}</span>
        </nav>
      </div>

      {/* File Tabs and Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <FileTabs files={activeFiles} onSwitch={onSwitchFile} onClose={onCloseFile} />

        {/* Undo/Redo */}
        <div className="flex items-center gap-4">
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
            <g clipPath="url(#clip0_72_89)">
              <path d="M20.9997 20.9995H19.2497C19.2479 19.3756 18.602 17.8187 17.4537 16.6705C16.3055 15.5222 14.7486 14.8763 13.1247 14.8745H8.89847V20.4867L0.7671 12.3553C0.274988 11.8631 -0.00146484 11.1955 -0.00146484 10.4995C-0.00146484 9.8034 0.274988 9.13584 0.7671 8.64358L8.89847 0.512207V6.12446H13.1247C15.2126 6.12677 17.2143 6.9572 18.6906 8.43355C20.167 9.90989 20.9974 11.9116 20.9997 13.9995V20.9995Z" fill="#1E1E1E"/>
            </g>
          </svg>
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
            <g clipPath="url(#clip0_72_92)">
              <path d="M0.000272751 20.9995H1.75027C1.75213 19.3756 2.39803 17.8187 3.54629 16.6705C4.69455 15.5222 6.25139 14.8763 7.87527 14.8745H12.1015V20.4867L20.2329 12.3553C20.725 11.8631 21.0015 11.1955 21.0015 10.4995C21.0015 9.8034 20.725 9.13584 20.2329 8.64358L12.1015 0.512207V6.12446H7.87527C5.78741 6.12677 3.78571 6.9572 2.30936 8.43355C0.833017 9.90989 0.00259018 11.9116 0.000272751 13.9995V20.9995Z" fill="#757575"/>
            </g>
          </svg>
        </div>

        {/* Share and Export */}
        <div className="flex items-center gap-6">
          <button
            onClick={onShowShareModal}
            className="flex items-center gap-2 text-ml-green font-inter font-bold"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 22C17.1667 22 16.4583 21.7083 15.875 21.125C15.2917 20.5417 15 19.8333 15 19C15 18.8833 15.0083 18.7625 15.025 18.6375C15.0417 18.5125 15.0667 18.4 15.1 18.3L8.05 14.2C7.76667 14.45 7.45 14.6458 7.1 14.7875C6.75 14.9292 6.38333 15 6 15C5.16667 15 4.45833 14.7083 3.875 14.125C3.29167 13.5417 3 12.8333 3 12C3 11.1667 3.29167 10.4583 3.875 9.875C4.45833 9.29167 5.16667 9 6 9C6.38333 9 6.75 9.07083 7.1 9.2125C7.45 9.35417 7.76667 9.55 8.05 9.8L15.1 5.7C15.0667 5.6 15.0417 5.4875 15.025 5.3625C15.0083 5.2375 15 5.11667 15 5C15 4.16667 15.2917 3.45833 15.875 2.875C16.4583 2.29167 17.1667 2 18 2C18.8333 2 19.5417 2.29167 20.125 2.875C20.7083 3.45833 21 4.16667 21 5C21 5.83333 20.7083 6.54167 20.125 7.125C19.5417 7.70833 18.8333 8 18 8C17.6167 8 17.25 7.92917 16.9 7.7875C16.55 7.64583 16.2333 7.45 15.95 7.2L8.9 11.3C8.93333 11.4 8.95833 11.5125 8.975 11.6375C8.99167 11.7625 9 11.8833 9 12C9 12.1167 8.99167 12.2375 8.975 12.3625C8.95833 12.4875 8.93333 12.6 8.9 12.7L15.95 16.8C16.2333 16.55 16.55 16.3542 16.9 16.2125C17.25 16.0708 17.6167 16 18 16C18.8333 16 19.5417 16.2917 20.125 16.875C20.7083 17.4583 21 18.1667 21 19C21 19.8333 20.7083 20.5417 20.125 21.125C19.5417 21.7083 18.8333 22 18 22Z" fill="#5CBF7D"/>
            </svg>
            SHARE
          </button>
          <button
            onClick={onShowExportModal}
            className="flex items-center gap-2 text-ml-green font-inter font-bold"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H13.5C13.8978 16.5 14.2794 16.342 14.5607 16.0607C14.842 15.7794 15 15.3978 15 15V9M12 4.5L9 1.5M9 1.5L6 4.5M9 1.5V11.25" stroke="#5CBF7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            EXPORT
          </button>
        </div>

        {/* User Avatars */}
        <div className="flex items-center gap-2">
          {/* Current User - Main User with Dropdown */}
          <div className="relative">
            <button
              onClick={onToggleUserDropdown}
              className="w-9 h-9 bg-ml-green rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors"
            >
              <span className="text-white font-inter font-bold">J</span>
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-inter font-medium text-sm text-gray-900">John Doe</p>
                  <p className="font-inter text-xs text-gray-500">john.doe@email.com</p>
                </div>

                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter"
                  onClick={onToggleUserDropdown}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-3">
                    <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Dashboard
                </Link>

                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-inter"
                  onClick={() => {
                    onToggleUserDropdown();
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
                    onToggleUserDropdown();
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
                      onToggleUserDropdown();
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

          {/* Collaborator Avatars */}
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-inter font-bold">J</span>
          </div>
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-inter font-bold">J</span>
          </div>
        </div>
      </div>
    </div>
  );
}

