import React from "react";
import { ActiveFile } from "../types";

interface FileTabsProps {
  files: ActiveFile[];
  onSwitch: (fileId: string) => void;
  onClose: (fileId: string) => void;
}

export default function FileTabs({ files, onSwitch, onClose }: FileTabsProps) {
  return (
    <div className="flex items-center gap-2">
      {files.map((file) => (
        <div
          key={file.id}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer ${
            file.isActive ? "bg-highlight text-white" : "bg-white text-black border border-gray-300"
          }`}
          onClick={() => onSwitch(file.id)}
        >
          <span className="font-inter text-base">{file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(file.id);
            }}
            className="hover:opacity-70"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9.75 3.25L3.25 9.75M3.25 3.25L9.75 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}



