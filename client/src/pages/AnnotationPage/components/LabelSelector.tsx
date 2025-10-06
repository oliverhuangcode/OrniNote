import React from 'react';
import { Settings } from 'lucide-react';

interface Label {
  _id: string;
  name: string;
  colour: string;
}

interface LabelSelectorProps {
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (labelId: string) => void;
  onManageLabels: () => void;
}

export default function LabelSelector({ labels, selectedLabelId, onSelectLabel, onManageLabels }: LabelSelectorProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Current Label:</span>
        <select
          value={selectedLabelId || ''}
          onChange={(e) => onSelectLabel(e.target.value)}
          className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select a label...</option>
          {labels.map((label) => (
            <option key={label._id} value={label._id}>
              {label.name}
            </option>
          ))}
        </select>
        {selectedLabelId && (
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border border-gray-300"
              style={{ backgroundColor: labels.find(l => l._id === selectedLabelId)?.colour }}
            />
            <span className="text-sm font-medium text-gray-900">
              {labels.find(l => l._id === selectedLabelId)?.name}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onManageLabels}
        className="ml-4 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
        title="Manage Labels"
      >
        <Settings size={16} />
        Manage Labels
      </button>
    </div>
  );
}