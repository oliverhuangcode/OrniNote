import type { User } from "@liveblocks/client";
import { Link, useNavigate } from "react-router-dom";
import { ActiveFile } from "../types";
import { ToolbarTool } from "../types";
import { ToolsMenu } from "./ToolsMenu";
import { Menu, MenuItem, MenuItems, MenuButton } from "@headlessui/react";
import { getAnonymousName, getInitials } from "../../../utils/mockData";

interface TopNavProps {
  projectName?: string;
  currentImage?: ActiveFile;
  activeFiles: ActiveFile[];
  onSwitchFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
  onShowShareModal: () => void;
  onShowExportModal: () => void;
  onShowCreateModal: () => void;
  onShowOpenModal: () => void;
  onShowHelpModal: () => void;
  onCanvasZoom: (direction: "in" | "out" | "reset") => void;
  onShowGrid: () => void;
  showGrid: boolean;
  tools: ToolbarTool[];
  onSelectTool: (toolId: string) => void;
  onAddImage: () => void;
  others: readonly User<any, any>[];
  cursorColors: string[];
  currentUser?: {
    username: string;
    email: string;
  };
  onSignOut: () => void; 
  onUndo: () => void;
  onRedo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function TopNav({
  projectName,
  currentImage,
  activeFiles,
  onSwitchFile,
  onCloseFile,
  onShowShareModal,
  onShowExportModal,
  onShowCreateModal,
  onShowOpenModal,
  onShowHelpModal,
  onCanvasZoom,
  onShowGrid,
  showGrid,
  tools,
  onSelectTool,
  onAddImage,
  others,
  cursorColors,
  currentUser, 
  onSignOut, 
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: TopNavProps) {
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (!currentUser?.username) return "U";

    const name = currentUser.username.trim();
    const parts = name.split(" ");

    if (parts.length >= 2) {
      // Get first letter of first two words (e.g., "John Doe" -> "JD")
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    // Get first two letters of single word (e.g., "John" -> "JO")
    return name.substring(0, 2).toUpperCase();
  };

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
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="font-inter text-base text-black hover:text-green-600 transition-colors">
                File
              </MenuButton>
              <MenuItems className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 focus:outline-none">
                <MenuItem
                  as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
                  onClick={onShowCreateModal}
                >
                  New Project
                </MenuItem>
                <MenuItem
                  as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
                  onClick={onShowOpenModal}
                >
                  Open
                </MenuItem>
                <MenuItem
                  as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
                  onClick={onShowExportModal}
                >
                  Export
                </MenuItem>
                <div className="border-t border-gray-100 my-1" />
                <MenuItem
                  as={Link}
                  to="/dashboard"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
                >
                  Close Project
                </MenuItem>
              </MenuItems>
            </Menu>

            {/* Edit Menu */}
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="font-inter text-base text-black hover:text-green-600 transition-colors">
                Edit
              </MenuButton>
              <MenuItems className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <MenuItem as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100 disabled:opacity-40"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  Undo
                </MenuItem>
                <MenuItem as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100 disabled:opacity-40"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  Redo
                </MenuItem>
                {/* ...the rest (Cut/Copy/Paste/Delete) */}
              </MenuItems>
            </Menu>

            {/* View Menu */}
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="font-inter text-base text-black hover:text-green-600 transition-colors">
                View
              </MenuButton>
              <MenuItems className="absolute top-8 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 focus:outline-none">
                <MenuItem
                  as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
                  onClick={() => onCanvasZoom("in")}
                >
                  Zoom In
                </MenuItem>
                <MenuItem
                  as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
                  onClick={() => onCanvasZoom("out")}
                >
                  Zoom Out
                </MenuItem>
                <MenuItem
                  as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
                  onClick={() => onCanvasZoom("reset")}
                >
                  Actual Size
                </MenuItem>
                <div className="border-t border-gray-100 my-1" />
                <MenuItem
                  as="button"
                  className="w-full px-4 py-2 text-left text-sm font-inter data-[focus]:bg-gray-100"
                  onClick={onShowGrid}
                >
                  {showGrid ? "Hide Grid" : "Show Grid"}
                </MenuItem>
              </MenuItems>
            </Menu>

            {/* Tools Menu */}
            <Menu as="div" className="relative inline-block text-left">
              <ToolsMenu tools={tools} onSelectTool={onSelectTool} />
            </Menu>

            {/* Static buttons */}
            <button
              className="font-inter text-base text-black hover:text-green-600 transition-colors"
              onClick={onShowShareModal}
            >
              Share
            </button>
            <button
              className="font-inter text-base text-black hover:text-green-600 transition-colors"
              onClick={onShowHelpModal}
            >
              Help
            </button>
          </div>

          {/* Right Side - User Menu */}
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-">
                {getUserInitials()}
              </div>
              <span className="text-sm font-medium">
                {currentUser?.username || "User"}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </MenuButton>
            <MenuItems className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>

              <MenuItem
                as="button"
                className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50"
                onClick={() => console.log("Profile")}
              >
                Profile Settings
              </MenuItem>
              <MenuItem
                as="button"
                className="w-full px-4 py-2 text-left font-inter text-sm hover:bg-gray-50"
                onClick={() => console.log("Profile")}
              >
                Help & Support
              </MenuItem>
              <div className="border-t border-gray-100 my-1"></div>
              <MenuItem
                as="button"
                className="w-full px-4 py-2 text-left font-inter text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  onSignOut();
                  navigate("/login");
                }}
              >
                Sign Out
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </nav>

      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm font-inter">
            <Link
              to="/dashboard"
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-700">{projectName || "Project"}</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-700">{currentImage?.name || "Image"}</span>
          </nav>

          {/* User Avatars */}
          {others.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {others.slice(0, 3).map(({ connectionId, presence }) => {
                  const username = presence?.userInfo?.name || "User";
                  const initials = getInitials(username);

                  return (
                    <div
                      key={connectionId}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-semibold text-xs"
                      style={{
                        backgroundColor:
                          cursorColors[connectionId % cursorColors.length],
                      }}
                      title={username}
                    >
                      {initials}
                    </div>
                  );
                })}
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

      {/* Project File Tabs */}
      {activeFiles.length > 0 && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="flex items-center px-4">
            {activeFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center px-4 py-2 border-r border-gray-300 cursor-pointer transition-colors ${
                  file.isActive
                    ? "bg-white text-gray-900 border-b-2 border-green-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* Add File Button */}
            <button
              className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={onAddImage}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm">Add Image</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
