import type { User } from "@liveblocks/client";
import { Link, useNavigate } from "react-router-dom";
import { ActiveFile } from "../types";

interface TopNavProps {
  projectId?: string;
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
  others: readonly User<any, any>[];
  cursorColors: string[];
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
  others,
  cursorColors
}: TopNavProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              OrniNote
            </Link>

            {/* File Menu */}
            <div className="relative">
              <button
                className="font-inter text-base text-black hover:text-green-600 transition-colors"
                onClick={onToggleFileMenu}
              >
                File
              </button>
              {showFileMenu && (
                <div className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50" onClick={() => {onToggleFileMenu(); console.log("New")}}>New Project</button>
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
                className="font-inter text-base text-black hover:text-green-600 transition-colors"
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
                className="font-inter text-base text-black hover:text-green-600 transition-colors"
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

            <button className="font-inter text-base text-black hover:text-green-600 transition-colors" onClick={() => console.log("Annotation menu")}>Annotation</button>
            <button className="font-inter text-base text-black hover:text-green-600 transition-colors" onClick={() => console.log("Layers menu")}>Layers</button>
            <button className="font-inter text-base text-black hover:text-green-600 transition-colors" onClick={() => console.log("Tools menu")}>Tools</button>
            <button className="font-inter text-base text-black hover:text-green-600 transition-colors" onClick={onShowShareModal}>Collaboration</button>
            <button className="font-inter text-base text-black hover:text-green-600 transition-colors" onClick={() => console.log("Settings menu")}>Settings</button>
            <button className="font-inter text-base text-black hover:text-green-600 transition-colors" onClick={() => console.log("Help menu")}>Help</button>
          </div>

          {/* Right side - User Menu */}
          <div className="relative">
            <button
              onClick={onToggleUserDropdown}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                U
              </div>
              <span className="text-sm font-medium">User</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50">Profile Settings</button>
                <button className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50">Help & Support</button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  className="w-full px-4 py-2 text-left font-inter text-sm text-red-600 hover:bg-red-50"
                  onClick={() => navigate("/login")}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm font-inter">
            <Link to="/dashboard" className="text-green-600 hover:text-green-800 transition-colors">
              Dashboard
            </Link>
            <span className="text-gray-400"></span>
            <span className="text-gray-700">Project {projectId}</span>
          </nav>

          {/* User Avatars */}
          {others.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {others.slice(0, 3).map(({ connectionId }) => (
                  <div
                    key={connectionId}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: cursorColors[connectionId % cursorColors.length] }}
                  />
                ))}
                {others.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs text-white font-medium">
                    +{others.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Tabs */}
      {activeFiles.length > 0 && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="flex items-center px-4">
            {activeFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center px-4 py-2 border-r border-gray-300 cursor-pointer transition-colors ${
                  file.isActive 
                    ? 'bg-white text-gray-900 border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => onSwitchFile(file.id)}
              >
                <span className="text-sm font-medium mr-2">{file.name}</span>
                {activeFiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseFile(file.id);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            {/* Add File Button */}
            <button
              className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => console.log("Add new file")}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm">Add Image</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}