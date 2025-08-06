import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Move,
  Search,
  Maximize2,
  Hexagon,
  PenTool,
  Edit3,
  Type,
  Pipette,
  Share,
  Upload,
  Undo,
  Redo,
  Eye,
  Lock,
  ChevronDown,
  X
} from 'lucide-react';

export default function Annotation() {
  const { projectId } = useParams();
  const [activeLayer, setActiveLayer] = useState<string>('neck-lines');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const layers = [
    { id: 'bounding-boxes', name: 'Bounding Boxes (1)', color: '#1E1E1E', visible: true, locked: false },
    { id: 'neck-lines', name: 'Neck Lines (1)', color: '#5CBF7D', visible: true, locked: false },
    { id: 'body-lines', name: 'Body Lines (1)', color: '#1E1E1E', visible: true, locked: false },
    { id: 'tail-lines', name: 'Tail Lines (1)', color: '#1E1E1E', visible: true, locked: false },
    { id: 'beak-lines', name: 'Beak Lines (1)', color: '#1E1E1E', visible: true, locked: false },
    { id: 'left-leg-lines', name: 'Left Leg Lines (2)', color: '#1E1E1E', visible: true, locked: false },
    { id: 'right-leg-lines', name: 'Right Leg Lines (2)', color: '#1E1E1E', visible: true, locked: false },
  ];

  const collaborators = [
    { id: '1', name: 'J', color: '#5CBF7D' },
    { id: '2', name: 'J', color: '#5BABE9' },
    { id: '3', name: 'J', color: '#F39A4D' }
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Menu Bar */}
      <div className="h-[110px] bg-white border-b border-brand-gray-400 flex flex-col">
        {/* Menu Items */}
        <div className="h-[51px] bg-white px-6 flex items-center gap-10 border-b border-brand-gray-400">
          <Link to="/dashboard" className="w-16 h-16 rounded-full bg-brand-gray-300 flex items-center justify-center text-xs font-bold">
            Logo
          </Link>
          <nav className="flex items-center gap-10">
            <span className="text-base text-black cursor-pointer">File</span>
            <span className="text-base text-black cursor-pointer">Edit</span>
            <span className="text-base text-black cursor-pointer">View</span>
            <span className="text-base text-black cursor-pointer">Annotation</span>
            <span className="text-base text-black cursor-pointer">Layers</span>
            <span className="text-base text-black cursor-pointer">Tools</span>
            <span className="text-base text-black cursor-pointer">Collaboration</span>
            <span className="text-base text-black cursor-pointer">Settings</span>
            <span className="text-base text-black cursor-pointer">Help</span>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="h-[60px] bg-white px-6 flex items-center justify-between">
          {/* File Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-4 py-2 bg-brand-green rounded-lg">
              <span className="text-white text-base">Duck.jpg</span>
              <X className="w-3 h-3 text-white" />
            </div>
            <div className="flex items-center gap-1 px-4 py-2 rounded-lg">
              <span className="text-black text-base">Eagle.jpg</span>
              <X className="w-3 h-3 text-black" />
            </div>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-4">
            <Undo className="w-5 h-5 text-brand-gray-700 cursor-pointer" />
            <Redo className="w-5 h-5 text-brand-gray-500 cursor-pointer" />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-6">
            {/* Collaborators */}
            <div className="flex items-center gap-2">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.name}
                </div>
              ))}
            </div>

            {/* Share/Export */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 text-brand-green font-bold"
            >
              <Share className="w-6 h-6" />
              SHARE
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 text-brand-green font-bold"
            >
              <Upload className="w-5 h-5" />
              EXPORT
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Toolbar */}
        <div className="w-[91px] bg-white border-r border-brand-gray-400 p-6">
          <div className="flex flex-col gap-5">
            {/* Tool Buttons */}
            <div className="w-12 h-12 bg-brand-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-gray-300">
              <Move className="w-6 h-6 text-black" />
            </div>
            <div className="w-12 h-12 bg-brand-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-gray-300">
              <Search className="w-8 h-8 text-black" />
            </div>
            <div className="w-12 h-12 bg-brand-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-gray-300">
              <Maximize2 className="w-6 h-6 text-black" />
            </div>
            <div className="w-12 h-12 bg-brand-green rounded-lg flex items-center justify-center cursor-pointer">
              <Hexagon className="w-8 h-8 text-white" />
            </div>
            <div className="w-12 h-12 bg-brand-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-gray-300">
              <div className="w-1 h-9 bg-black rounded-full" />
            </div>
            <div className="w-12 h-12 bg-brand-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-gray-300">
              <PenTool className="w-8 h-8 text-black transform -rotate-90" />
            </div>
            <div className="w-12 h-12 bg-brand-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-gray-300">
              <Edit3 className="w-9 h-9 text-black" />
            </div>
            <div className="w-12 h-12 bg-brand-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-gray-300">
              <Type className="w-7 h-7 text-black" />
            </div>
            <div className="w-12 h-12 bg-brand-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-gray-300">
              <Pipette className="w-8 h-8 text-black" />
            </div>
          </div>

          {/* Color Swatches */}
          <div className="mt-16">
            <div className="w-11 h-11 bg-brand-gray-600 rounded mb-1" />
            <div className="w-11 h-11 bg-brand-green rounded" />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-brand-gray-200 flex items-center justify-center">
          <div className="text-brand-gray-500 text-lg">
            Canvas Area - Project {projectId}
          </div>
        </div>

        {/* Right Layers Panel */}
        <div className="w-[264px] bg-white border-l border-brand-gray-400">
          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Classes..."
                className="w-full h-9 px-3 pr-8 rounded-lg bg-brand-gray-200 text-base placeholder-brand-gray-500 focus:outline-none"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-gray-500" />
            </div>
          </div>

          {/* Object */}
          <div className="border-t border-brand-gray-300 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-4 h-4 text-black" />
              <span className="text-sm text-black">Duck</span>
            </div>
          </div>

          {/* Layers Header */}
          <div className="h-9 bg-brand-gray-200 flex items-center px-4">
            <ChevronDown className="w-6 h-6 text-brand-gray-500 transform rotate-90" />
            <span className="ml-2 text-base font-semibold text-brand-gray-500">Layers</span>
          </div>

          {/* Layers List */}
          <div className="flex-1">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className={`border-b border-brand-gray-100 p-4 cursor-pointer ${
                  activeLayer === layer.id ? 'bg-brand-gray-50' : 'hover:bg-brand-gray-50'
                }`}
                onClick={() => setActiveLayer(layer.id)}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      layer.id === 'neck-lines' ? 'text-brand-green' : 'text-black'
                    }`}
                  >
                    {layer.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Eye
                      className={`w-4 h-4 ${
                        layer.id === 'neck-lines' ? 'text-brand-green' : 'text-black'
                      }`}
                    />
                    <Lock
                      className={`w-4 h-4 ${
                        layer.id === 'neck-lines' ? 'text-brand-green' : 'text-black'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Share Project</h2>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-base text-gray-500 mb-6">
              Share this project with your teammates for real-time collaboration
            </p>
            <div className="flex gap-3 mb-6">
              <input
                type="email"
                placeholder="example@email.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
              />
              <button className="px-6 py-3 bg-brand-green text-white rounded-lg font-medium">
                Invite
              </button>
            </div>
            <div className="space-y-3">
              {collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    {collaborator.name}
                  </div>
                  <span className="flex-1">Team Member {index + 1}</span>
                  <select className="px-3 py-1 border border-gray-300 rounded">
                    <option>Editor</option>
                    <option>Viewer</option>
                    <option>Owner</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Export</h2>
              <button onClick={() => setShowExportModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold mb-2">Format</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg">
                    <option>JSON</option>
                    <option>XML</option>
                    <option>TXT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-bold mb-2">Pages</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg">
                    <option>All pages</option>
                    <option>Current page</option>
                  </select>
                </div>
                <button className="w-full py-3 bg-brand-green text-white rounded-lg font-bold">
                  EXPORT
                </button>
              </div>
              <div>
                <h3 className="text-base text-gray-500 mb-4">Preview</h3>
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Export Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
