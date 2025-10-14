import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { labelService, Label } from '../../../services/labelService';

interface ManageLabelsProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onLabelsChanged: () => void;
}

export default function ManageLabels({ isOpen, onClose, projectId, onLabelsChanged }: ManageLabelsProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#456BA1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const newColorInputRef = useRef<HTMLInputElement>(null);
  const editColorInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

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
      setNewLabelColor('#456BA1'); 
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
                <path d="M3 7L3 4C3 3.44772 3.44772 3 4 3L7 3M13 3L16 3C16.5523 3 17 3.44772 17 4L17 7M17 13V16C17 16.5523 16.5523 17 16 17H13M7 17H4C3.44772 17 3 16.5523 3 16V13" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-inter">Manage Labels</h2>
              <p className="text-sm text-gray-500 font-inter">Create and organize annotation labels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-inter flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                <path d="M8 1.33334V8.00001M8 10.6667V11.3333M14.6667 8.00001C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8.00001C1.33333 4.31811 4.3181 1.33334 8 1.33334C11.6819 1.33334 14.6667 4.31811 14.6667 8.00001Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Create New Label */}
          <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 font-inter">Create New Label</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name (e.g., Sparrow, Nest)"
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter text-sm transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateLabel()}
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => newColorInputRef.current?.click()}
                  className="w-11 h-11 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:shadow-md transition-all flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: newLabelColor }}
                  title="Pick color"
                />
                <input
                  ref={newColorInputRef}
                  type="color"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <button
                onClick={handleCreateLabel}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center gap-2 font-inter text-sm font-medium shadow-sm"
              >
                <Plus size={18} />
                Add Label
              </button>
            </div>
          </div>

          {/* Labels List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 font-inter">
                Existing Labels
              </h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {labels.length} {labels.length === 1 ? 'label' : 'labels'}
              </span>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
                <p className="text-sm text-gray-500 font-inter">Loading labels...</p>
              </div>
            ) : labels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                    <path d="M7 7H7.01M7 12H7.01M7 17H7.01M12 7H17M12 12H17M12 17H17" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 text-center font-inter mb-1">No labels yet</p>
                <p className="text-xs text-gray-500 text-center font-inter">Create your first label above to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {labels.map((label) => (
                  <div
                    key={label._id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    {editingId === label._id ? (
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-inter text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        />
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => editColorInputRef.current?.click()}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors flex-shrink-0"
                            style={{ backgroundColor: editColor }}
                            title="Pick color"
                          />
                          <input
                            ref={editColorInputRef}
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                          style={{ backgroundColor: label.colour }}
                        />
                        <span className="flex-1 font-medium text-gray-900 font-inter text-sm">{label.name}</span>
                        <button
                          onClick={() => handleStartEdit(label)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit label"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLabel(label._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete label"
                        >
                          <Trash2 size={16} />
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
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-inter text-sm font-medium shadow-sm"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
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