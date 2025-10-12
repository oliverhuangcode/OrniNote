import React, { useState, useEffect, useMemo } from "react";
import { Settings, X } from "lucide-react";
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
    <div className="w-72 bg-white border-l border-gray-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 flex items-center justify-between">
        <span className="font-inter text-base font-semibold text-gray-700">
          Labels
        </span>
        <button
          onClick={onManageLabels}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Manage Labels"
        >
          <Settings className="text-gray-600 text-lg" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-300 relative">
        <input
          type="text"
          placeholder="Search Labels..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full bg-gray-100 rounded-lg px-3 py-2 pr-8 font-inter text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-highlight"
        />
        {searchInput && (
          <button
            onClick={handleClearSearch}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Label List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLabels.length === 0 ? (
          <div className="text-gray-500 text-sm text-center mt-4 px-4">
            No labels found.
          </div>
        ) : (
          filteredLabels.map((label) => (
            <button
              key={label._id}
              onClick={() => onSelectLabel(label._id)}
              className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 transition ${
                selectedLabelId === label._id
                  ? "bg-green-100 border-l-4 border-green-500"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: label.colour }}
                />
                <span
                  className={`font-inter text-sm ${
                    selectedLabelId === label._id
                      ? "text-green-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {label.name}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default LabelPanel;
