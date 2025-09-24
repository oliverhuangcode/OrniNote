// client/src/components/modals/CreateProjectModal/CreateProject.tsx
import { useState } from "react";
import { useS3Upload } from "../../../services/s3UploadService";

interface CreateProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: ProjectData) => void;
}

interface ProjectData {
  name: string;
  width: number;
  height: number;
  imageUrl?: string;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Use the S3 upload hook
  const { isUploading, progress, error, uploadImage, resetUpload } = useS3Upload();

  // Don't render if modal is not open
  if (!isOpen) return null;

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
      handleFileSelection(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Clear any previous errors
    resetUpload();

    // Auto-populate image dimensions if possible
    const img = new Image();
    img.onload = () => {
      setProjectData(prev => ({
        ...prev,
        width: img.naturalWidth,
        height: img.naturalHeight
      }));
    };
    img.src = url;
  };

  // In CreateProject.tsx, update the handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate required fields
  if (!projectData.name.trim()) {
    alert('Project name is required.');
    return;
  }

  if (!selectedFile) {
    alert('Please select an image file.');
    return;
  }
  
  let imageUrl = projectData.imageUrl;
  
  // Upload image if one is selected
  if (selectedFile) {
    const uploadResult = await uploadImage(selectedFile);
    if (!uploadResult) {
      // Upload failed, error is already set in the hook
      return;
    }
    imageUrl = uploadResult;
  }
  
  const finalProjectData = {
    ...projectData,
    imageUrl,
    imageFilename: selectedFile?.name || 'uploaded-image.jpg', // Use actual filename
  };
  
  // Call the parent's create project handler
  await onCreateProject(finalProjectData);
  handleClose();
};

  const handleClose = () => {
    // Cleanup preview URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    resetUpload();
    
    // Reset form data
    setProjectData({
      name: "Duck",
      width: 1920,
      height: 1080,
      teamMembers: ["1", "2", "3"],
    });
    
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Create Project</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-600 text-sm">
                <strong>Upload Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="font-inter font-bold text-lg text-black mb-2 block">
              Upload Image
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-lg"
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{selectedFile?.name}</p>
                    <p>{selectedFile && formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }
                      setSelectedFile(null);
                      resetUpload();
                    }}
                    className="text-red-600 hover:text-red-800 text-sm underline"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    Drag and drop an image here
                  </div>
                  <p className="text-gray-500">or</p>
                  <label className="cursor-pointer">
                    <span className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="font-inter font-bold text-lg text-black mb-2 block">
              Name
            </label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-200 rounded border-none font-inter text-black focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            {/* Width */}
            <div>
              <label className="font-inter font-bold text-lg text-black mb-2 block">
                Width
              </label>
              <input
                type="number"
                value={projectData.width}
                onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-200 rounded border-none font-inter text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                min="1"
                required
              />
            </div>

            {/* Height */}
            <div>
              <label className="font-inter font-bold text-lg text-black mb-2 block">
                Height
              </label>
              <input
                type="number"
                value={projectData.height}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-200 rounded border-none font-inter text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                min="1"
                required
              />
            </div>
          </div>

          {/* Team */}
          <div>
            <label className="font-inter font-bold text-lg text-black mb-2 block">
              Team
            </label>
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

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Create Button */}
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className={`w-full font-inter font-bold text-lg py-3 rounded-lg transition-all duration-200 shadow-lg ${
              isUploading || !selectedFile
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isUploading ? `Uploading... ${Math.round(progress)}%` : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
}