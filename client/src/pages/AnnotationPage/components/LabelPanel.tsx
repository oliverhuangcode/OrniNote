import React, { useState, useEffect, useMemo } from "react";
import { Settings, X, Search } from "lucide-react";
import { Label } from "../../../services/labelService";

interface LabelPanelProps {
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (labelId: string) => void;
  onManageLabels: () => void;
}

const LabelPanel: React.FC<LabelPanelProps> = ({
  labels,
  selectedLabelId,
  onSelectLabel,
  onManageLabels,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ⏱️ Debounce search input (200ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 200);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // 🔍 Filter labels
  const filteredLabels = useMemo(() => {
    if (!searchTerm.trim()) return labels;
    return labels.filter((l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [labels, searchTerm]);

  // 🧹 Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-inter text-sm font-semibold text-gray-900">
          Labels
        </h3>
        <button
          onClick={onManageLabels}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Manage Labels"
        >
          <Settings className="text-gray-600" size={18} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search labels..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-50 rounded-lg pl-9 pr-8 py-2 font-inter text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Label List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLabels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Search className="text-gray-400" size={20} />
            </div>
            <p className="text-gray-500 text-sm text-center">
              {searchTerm ? "No labels found" : "No labels yet"}
            </p>
            {!searchTerm && (
              <button
                onClick={onManageLabels}
                className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Create your first label
              </button>
            )}
          </div>
        ) : (
          <div className="py-1">
            {filteredLabels.map((label) => (
              <button
                key={label._id}
                onClick={() => onSelectLabel(label._id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all ${
                  selectedLabelId === label._id
                    ? "bg-green-50 border-l-3 border-l-green-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: label.colour }}
                />
                <span
                  className={`font-inter text-sm truncate ${
                    selectedLabelId === label._id
                      ? "text-green-900 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {label.name}
                </span>
                {selectedLabelId === label._id && (
                  <svg 
                    className="ml-auto text-green-600 flex-shrink-0" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path 
                      d="M13.3337 4L6.00033 11.3333L2.66699 8" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelPanel;