import React from "react";
import type { User } from "@liveblocks/client";
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
    <div className="bg-white border-b border-gray-300">
      {/* Logo */}
      <div className="h-28 flex items-center px-4">
        <Link
          to="/dashboard"
          className="w-16 h-16 bg-highlight rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors cursor-pointer"
        >
          <span className="font-inter font-bold text-xs text-white">ML Tool</span>
        </Link>
      </div>

      {/* Menu Bar */}
      <div className="flex items-center gap-10 px-4 py-4 border-b border-gray-300 bg-white relative">
        {/* File Menu */}
        <div className="relative">
          <button
            className="font-inter text-base text-black hover:text-highlight transition-colors"
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
            className="font-inter text-base text-black hover:text-highlight transition-colors"
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
            className="font-inter text-base text-black hover:text-highlight transition-colors"
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

        <button className="font-inter text-base text-black hover:text-highlight transition-colors" onClick={() => console.log("Annotation menu")}>Annotation</button>
        <button className="font-inter text-base text-black hover:text-highlight transition-colors" onClick={() => console.log("Layers menu")}>Layers</button>
        <button className="font-inter text-base text-black hover:text-highlight transition-colors" onClick={() => console.log("Tools menu")}>Tools</button>
        <button className="font-inter text-base text-black hover:text-highlight transition-colors" onClick={onShowShareModal}>Collaboration</button>
        <button className="font-inter text-base text-black hover:text-highlight transition-colors" onClick={() => console.log("Settings menu")}>Settings</button>
        <button className="font-inter text-base text-black hover:text-highlight transition-colors" onClick={() => console.log("Help menu")}>Help</button>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <nav className="flex items-center space-x-2 text-sm font-inter">
          <Link to="/dashboard" className="text-highlight hover:text-highlight/80 transition-colors">
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
            className="flex items-center gap-2 text-highlight font-inter font-bold"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 22C17.1667 22 16.4583 21.7083 15.875 21.125C15.2917 20.5417 15 19.8333 15 19C15 18.8833 15.0083 18.7625 15.025 18.6375C15.0417 18.5125 15.0667 18.4 15.1 18.3L8.05 14.2C7.76667 14.45 7.45 14.6458 7.1 14.7875C6.75 14.9292 6.38333 15 6 15C5.16667 15 4.45833 14.7083 3.875 14.125C3.29167 13.5417 3 12.8333 3 12C3 11.1667 3.29167 10.4583 3.875 9.875C4.45833 9.29167 5.16667 9 6 9C6.38333 9 6.75 9.07083 7.1 9.2125C7.45 9.35417 7.76667 9.55 8.05 9.8L15.1 5.7C15.0667 5.6 15.0417 5.4875 15.025 5.3625C15.0083 5.2375 15 5.11667 15 5C15 4.16667 15.2917 3.45833 15.875 2.875C16.4583 2.29167 17.1667 2 18 2C18.8333 2 19.5417 2.29167 20.125 2.875C20.7083 3.45833 21 4.16667 21 5C21 5.83333 20.7083 6.54167 20.125 7.125C19.5417 7.70833 18.8333 8 18 8C17.6167 8 17.25 7.92917 16.9 7.7875C16.55 7.64583 16.2333 7.45 15.95 7.2L8.9 11.3C8.93333 11.4 8.95833 11.5125 8.975 11.6375C8.99167 11.7625 9 11.8833 9 12C9 12.1167 8.99167 12.2375 8.975 12.3625C8.95833 12.4875 8.93333 12.6 8.9 12.7L15.95 16.8C16.2333 16.55 16.55 16.3542 16.9 16.2125C17.25 16.0708 17.6167 16 18 16C18.8333 16 19.5417 16.2917 20.125 16.875C20.7083 17.4583 21 18.1667 21 19C21 19.8333 20.7083 20.5417 20.125 21.125C19.5417 21.7083 18.8333 22 18 22Z" fill="#5CBF7D"/>
            </svg>
            SHARE
          </button>
          <button
            onClick={onShowExportModal}
            className="flex items-center gap-2 text-highlight font-inter font-bold"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H13.5C13.8978 16.5 14.2794 16.342 14.5607 16.0607C14.842 15.7794 15 15.3978 15 15V9M12 4.5L9 1.5M9 1.5L6 4.5M9 1.5V11.25" stroke="#5CBF7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            EXPORT
          </button>
        </div>

        {/* User Avatars */}
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
      </div>
    </div>
  );
}

