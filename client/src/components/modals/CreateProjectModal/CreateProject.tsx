import { useState } from "react";

interface CreateProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: ProjectData) => void;
}

interface ProjectData {
  name: string;
  width: number;
  height: number;
  file?: File;
  teamMembers: string[];
}

const teamMembers = [
  { id: 1, name: "J", color: "#5CBF7D" },
  { id: 2, name: "J", color: "#5BABE9" },
  { id: 3, name: "J", color: "#F39A4D" },
];

export default function CreateProject({ isOpen, onClose, onCreateProject }: CreateProjectProps) {
  const [projectData, setProjectData] = useState<ProjectData>({
    name: "Duck",
    width: 1920,
    height: 1080,
    teamMembers: ["1", "2", "3"],
  });
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field: keyof ProjectData, value: string | number) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setProjectData(prev => ({ ...prev, file }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProjectData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(projectData);
    onClose();
  };

  const toggleTeamMember = (memberId: string) => {
    setProjectData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter(id => id !== memberId)
        : [...prev.teamMembers, memberId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl relative shadow-2xl">
        {/* Header */}
        <div className="bg-gray-200 h-14 rounded-t-3xl flex items-center px-8 relative">
          <h2 className="font-inter font-bold text-lg text-gray-600">New Project</h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-600"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M19.5 6.5L6.5 19.5M6.5 6.5L19.5 19.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12">
          {/* File Upload Area */}
          <div className="mb-8">
            <div
              className={`relative border-2 border-dashed rounded-3xl h-64 flex items-center justify-center transition-colors ${
                dragActive ? "border-ml-green bg-ml-green bg-opacity-10" : "border-ml-gray bg-gray-100"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className="mb-4">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto text-gray-600">
                    <path d="M42 30V38C42 39.0609 41.5786 40.0783 40.8284 40.8284C40.0783 41.5786 39.0609 42 38 42H10C8.93913 42 7.92172 41.5786 7.17157 40.8284C6.42143 40.0783 6 39.0609 6 38V30M34 16L24 6M24 6L14 16M24 6V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="font-inter text-lg text-gray-600">
                  <span className="font-bold">Choose a file </span>
                  <span>or drag it here</span>
                </div>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
            {projectData.file && (
              <p className="mt-2 text-sm text-gray-600">Selected: {projectData.file.name}</p>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Name */}
            <div>
              <label className="font-inter font-bold text-lg text-black mb-2 block">Name</label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-200 rounded border-none font-inter text-black focus:outline-none focus:ring-2 focus:ring-ml-green"
              />
            </div>

            {/* Width */}
            <div>
              <label className="font-inter font-bold text-lg text-black mb-2 block">Width</label>
              <input
                type="number"
                value={projectData.width}
                onChange={(e) => handleInputChange('width', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-200 rounded border-none font-inter text-black focus:outline-none focus:ring-2 focus:ring-ml-green"
              />
            </div>

            {/* Height */}
            <div>
              <label className="font-inter font-bold text-lg text-black mb-2 block">Height</label>
              <input
                type="number"
                value={projectData.height}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-200 rounded border-none font-inter text-black focus:outline-none focus:ring-2 focus:ring-ml-green"
              />
            </div>

            {/* Team */}
            <div>
              <label className="font-inter font-bold text-lg text-black mb-2 block">Team</label>
              <div className="flex items-center gap-2">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleTeamMember(member.id.toString())}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-inter font-bold transition-opacity ${
                      projectData.teamMembers.includes(member.id.toString()) ? 'opacity-100' : 'opacity-50'
                    }`}
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name}
                  </button>
                ))}
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-black hover:bg-gray-400 transition-colors"
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11.0002 4.58337V17.4167M4.5835 11H17.4168" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            type="submit"
            className="w-full bg-ml-green text-white font-inter font-bold text-lg py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
