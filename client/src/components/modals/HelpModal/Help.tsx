import { useEffect, useRef } from "react";

interface HelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenHelpModal({ isOpen, onClose }: HelpProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

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
            <path
              d="M18 6L6 18M6 6L18 18"
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                   10-4.48 10-10S17.52 2 12 2zm.75 17h-1.5v-1.5h1.5V19zm1.07-7.75-.9.92C12.45 12.9 12.25 13.5 12.25 14h-1.5v-.5c0-.83.34-1.63.93-2.22l1.24-1.26c.24-.24.38-.57.38-.92
                   0-.73-.6-1.32-1.32-1.32s-1.32.59-1.32 1.32H9.25c0-1.56 1.27-2.82 2.82-2.82S14.9 7.94 14.9 9.5c0 .66-.26 1.3-.73 1.77z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="font-inter font-semibold text-xl text-gray-900">Help</h2>
          </div>

          <p className="text-gray-600 font-inter text-sm mb-6">
            Got questions? Our team is happy to help!
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 text-sm font-inter">
              Email us at{" "}
              <a
                href="mailto:orninote@gmail.com"
                className="text-green-600 underline hover:text-green-700 font-medium"
              >
                orninote@gmail.com
              </a>{" "}
              for any support or feature requests.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
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
