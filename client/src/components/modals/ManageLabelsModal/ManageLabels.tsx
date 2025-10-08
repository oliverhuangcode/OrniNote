import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { labelService, Label } from '../../../services/labelService';

interface ManageLabelsProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onLabelsChanged: () => void; // Callback to refresh labels in parent
}


export default function ManageLabels({ isOpen, onClose, projectId, onLabelsChanged }: ManageLabelsProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#FF6B6B');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const newColorInputRef = useRef<HTMLInputElement>(null);
  const editColorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadLabels();
    }
  }, [isOpen, projectId]);

  const loadLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedLabels = await labelService.getLabelsForProject(projectId);
      setLabels(fetchedLabels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load labels');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      setError('Label name is required');
      return;
    }

    try {
      setError(null);
      await labelService.createLabel({
        projectId,
        name: newLabelName.trim(),
        colour: newLabelColor
      });
      setNewLabelName('');
      setNewLabelColor('#FF6B6B');
      await loadLabels();
      onLabelsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create label');
    }
  };

  const handleStartEdit = (label: Label) => {
    setEditingId(label._id);
    setEditName(label.name);
    setEditColor(label.colour);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      setError(null);
      await labelService.updateLabel(editingId, {
        name: editName.trim(),
        colour: editColor
      });
      setEditingId(null);
      await loadLabels();
      onLabelsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update label');
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!window.confirm('Are you sure you want to delete this label? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await labelService.deleteLabel(labelId);
      await loadLabels();
      onLabelsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete label');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Manage Labels</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Create New Label */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Create New Label</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name (e.g., Sparrow, Nest)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateLabel()}
              />
              <div className="relative">
              <button
                type="button"
                onClick={() => newColorInputRef.current?.click()}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors flex-shrink-0"
                style={{ backgroundColor: newLabelColor }}
                title="Pick color"
              />
              <input
                ref={newColorInputRef}
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="absolute top-full left-1/2 -translate-x-1/2 -mt-8 w-10 h-10 opacity-0 cursor-pointer"
              />
            </div>
              <button
                onClick={handleCreateLabel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          {/* Labels List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Existing Labels ({labels.length})
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading labels...</div>
            ) : labels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No labels yet. Create your first label above.
              </div>
            ) : (
              <div className="space-y-2">
                {labels.map((label) => (
                  <div
                    key={label._id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    {editingId === label._id ? (
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => editColorInputRef.current?.click()}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors flex-shrink-0"
                            style={{ backgroundColor: editColor }}
                            title="Pick color"
                          />
                          <input
                            ref={editColorInputRef}
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="absolute top-full left-1/2 -translate-x-1/2 -mt-8 w-10 h-10 opacity-0 cursor-pointer"
                          />
                        </div>
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: label.colour }}
                        />
                        <span className="flex-1 font-medium text-gray-900">{label.name}</span>
                        <button
                          onClick={() => handleStartEdit(label)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteLabel(label._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}