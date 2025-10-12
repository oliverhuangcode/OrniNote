import React, { useState } from "react";
import { Plus, Check, Edit2, Trash2 } from "lucide-react";

interface Label {
  _id: string;
  name: string;
  colour: string;
  shortcut?: string;
}

interface LabelPanelProps {
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (labelId: string) => void;
  onCreateLabel: (name: string, color: string) => Promise<void>;
  onUpdateLabel: (labelId: string, name: string, color: string) => Promise<void>;
  onDeleteLabel: (labelId: string) => Promise<void>;
}

const LABEL_COLORS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#6366F1",
  "#84CC16", "#A855F7", "#EAB308", "#22C55E", "#0EA5E9"
];

export default function LabelPanel({
  labels,
  selectedLabelId,
  onSelectLabel,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel
}: LabelPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    
    await onCreateLabel(newLabelName.trim(), newLabelColor);
    setIsCreating(false);
    setNewLabelName("");
    setNewLabelColor(LABEL_COLORS[0]);
  };

  const handleUpdateLabel = async (labelId: string) => {
    if (!newLabelName.trim()) return;
    
    await onUpdateLabel(labelId, newLabelName.trim(), newLabelColor);
    setEditingLabelId(null);
    setNewLabelName("");
  };

  const startEdit = (label: Label) => {
    setEditingLabelId(label._id);
    setNewLabelName(label.name);
    setNewLabelColor(label.colour);
  };

  const cancelEdit = () => {
    setEditingLabelId(null);
    setIsCreating(false);
    setNewLabelName("");
  };

  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-white border-l border-gray-300 flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-300">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-200 rounded-lg px-3 py-2 pr-10 font-inter text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-highlight"
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="font-inter text-base font-semibold text-gray-600">Labels</span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-gray-300 rounded transition-colors"
          title="Add Label"
        >
          <Plus size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Label List */}
      <div className="flex-1 overflow-y-auto p-3">
        {labels.length === 0 && !isCreating && (
          <div className="text-center text-gray-400 text-sm py-8">
            <p className="font-inter">No labels yet.</p>
            <p className="font-inter text-xs mt-1">Create one to start annotating.</p>
          </div>
        )}

        {filteredLabels.map((label) => (
          <div key={label._id} className="mb-2">
            {editingLabelId === label._id ? (
              // Edit Mode
              <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2 font-inter"
                  placeholder="Label name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateLabel(label._id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
                <div className="flex gap-1 mb-3 flex-wrap">
                  {LABEL_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewLabelColor(color)}
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        newLabelColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateLabel(label._id)}
                    className="flex-1 px-3 py-1.5 bg-highlight text-white rounded font-inter text-sm hover:opacity-90 transition-opacity"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded font-inter text-sm hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <button
                onClick={() => onSelectLabel(label._id)}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all group ${
                  selectedLabelId === label._id
                    ? 'bg-highlight bg-opacity-10 border-2 border-highlight'
                    : 'bg-gray-100 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <div
                  className="w-5 h-5 rounded flex-shrink-0"
                  style={{ backgroundColor: label.colour }}
                />
                <span className="flex-1 text-left text-sm font-inter font-medium text-gray-900 truncate">
                  {label.name}
                </span>
                {selectedLabelId === label._id && (
                  <Check size={18} className="text-highlight flex-shrink-0" />
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(label);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete label "${label.name}"? This will not delete annotations using this label.`)) {
                        onDeleteLabel(label._id);
                      }
                    }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </button>
            )}
          </div>
        ))}

        {/* Create New Label Form */}
        {isCreating && (
          <div className="p-3 bg-gray-100 rounded-lg border border-gray-300 mb-2">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2 font-inter"
              placeholder="Label name (e.g., 'head', 'wing')"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateLabel();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <div className="flex gap-1 mb-3 flex-wrap">
              {LABEL_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewLabelColor(color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    newLabelColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateLabel}
                className="flex-1 px-3 py-1.5 bg-highlight text-white rounded font-inter text-sm hover:opacity-90 transition-opacity"
              >
                Create
              </button>
              <button
                onClick={cancelEdit}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded font-inter text-sm hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {searchQuery && filteredLabels.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4">
            <p className="font-inter">No labels found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-3 border-t border-gray-300 bg-gray-100">
        <div className="text-xs font-inter text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Total Labels:</span>
            <span className="font-semibold">{labels.length}</span>
          </div>
          {selectedLabelId && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <span className="text-highlight font-medium">
                Active: {labels.find(l => l._id === selectedLabelId)?.name}
              </span>
            </div>
          )}
          {!selectedLabelId && labels.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-300 text-amber-600">
              ⚠ Select a label to start annotating
            </div>
          )}
        </div>
      </div>
    </div>
  );
}