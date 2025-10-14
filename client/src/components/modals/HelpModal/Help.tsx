import { useEffect, useState } from "react";
import { projectService } from "../../../services/projectService";
import { Link } from "react-router-dom";

interface HelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenHelpModal({ isOpen, onClose }: HelpProps) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[80vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Help</h2>

          {/* Close button */}
          <button 
            onClick={onClose} 
            className="text-black rounded p-1 bg-transparent hover:bg-gray-200 transition-colors"
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
        </div>

        {/* Content */}
        <div className="text-gray-700 text-base space-y-4">
          <p>
            Got questions? Our team is happy to help!
          </p>
          <p>
            Email us at: {" "}
            <a
              href="mailto:orninote@gmail.com"
              className="text-blue-600 underline font-medium hover:text-blue-800"
            >
              orninote@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}