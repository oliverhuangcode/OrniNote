import { useState } from "react";
import { useS3Upload, s3UploadService } from "../../../services/s3UploadService";
import { getAuthHeaders } from "../../../utils/apiHelper";

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
  imageFilename?: string;
  teamMembers: string[];
  inviteEmails?: string[]; // Emails to invite after project creation
  additionalImages?: Array<{
    imageUrl: string;
    imageFilename: string;
    imageWidth: number;
    imageHeight: number;
  }>;
}

interface ImageData {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

interface PendingInvite {
  email: string;
  color: string;
  initial: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Generate a random color for invite avatars
const generateColor = () => {
  const colors = ["#5CBF7D", "#5BABE9", "#F39A4D", "#9B59B6", "#E74C3C", "#3498DB"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function CreateProject({ isOpen, onClose, onCreateProject }: CreateProjectProps) {
  const [projectData, setProjectData] = useState<ProjectData>({
    name: "",
    width: 1920,
    height: 1080,
    teamMembers: [],
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
  } | null>(null);
  
  // Team collaboration state
  const [email, setEmail] = useState("");
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use the S3 upload hook
  const { error: uploadError, resetUpload } = useS3Upload();

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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    try {
      setIsProcessing(true);

      // Separate zip files and image files
      const zipFiles: File[] = [];
      const imageFiles: File[] = [];
      
      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.zip')) {
          zipFiles.push(file);
        } else {
          imageFiles.push(file);
        }
      }

      // Extract images from zip files
      for (const zipFile of zipFiles) {
        console.log('Extracting images from zip:', zipFile.name);
        const extractedImages = await s3UploadService.extractImagesFromZip(zipFile);
        imageFiles.push(...extractedImages);
        console.log(`Extracted ${extractedImages.length} images from ${zipFile.name}`);
      }

      if (imageFiles.length === 0) {
        alert('No valid image files found');
        setIsProcessing(false);
        return;
      }

      // Validate all files
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      for (const file of imageFiles) {
        if (!file.type.startsWith('image/') && !validTypes.includes(file.type)) {
          alert(`Invalid file type: ${file.name} (${file.type}). Please upload only image files.`);
          setIsProcessing(false);
          return;
        }
      }

      // Create preview data for all images
      const imageDataArray: ImageData[] = await Promise.all(
        imageFiles.map(async (file) => {
          const img = new Image();
          const previewUrl = URL.createObjectURL(file);
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = previewUrl;
          });

          return {
            file,
            previewUrl,
            width: img.naturalWidth,
            height: img.naturalHeight
          };
        })
      );

      // Set project dimensions to the largest width and height across all images
      if (imageDataArray.length > 0) {
        const maxWidth = Math.max(...imageDataArray.map(img => img.width));
        const maxHeight = Math.max(...imageDataArray.map(img => img.height));
        
        setProjectData(prev => ({
          ...prev,
          width: maxWidth,
          height: maxHeight
        }));
      }

      setSelectedImages(imageDataArray);
      resetUpload();
    } catch (err) {
      console.error('Error processing files:', err);
      alert(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].previewUrl);
      newImages.splice(index, 1);
      
      if (newImages.length > 0) {
        const maxWidth = Math.max(...newImages.map(img => img.width));
        const maxHeight = Math.max(...newImages.map(img => img.height));
        
        setProjectData(prev => ({
          ...prev,
          width: maxWidth,
          height: maxHeight
        }));
      }
      
      return newImages;
    });
  };

  // Add team member invite
  const handleAddTeamMember = () => {
    if (!email.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check for duplicates
    if (pendingInvites.some(invite => invite.email.toLowerCase() === email.toLowerCase())) {
      setError("This email has already been added");
      return;
    }

    // Add to pending invites
    setPendingInvites(prev => [
      ...prev,
      {
        email: email.trim(),
        color: generateColor(),
        initial: email.charAt(0).toUpperCase()
      }
    ]);

    setEmail("");
    setError(null);
  };

  // Remove pending invite
  const removeTeamMember = (emailToRemove: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.email !== emailToRemove));
  };

  // Send invites after project creation
  const sendInvites = async (projectId: string, projectName: string) => {
    const invitePromises = pendingInvites.map(async (invite) => {
      try {
        const response = await fetch(`${API_BASE_URL}/invite`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            email: invite.email,
            projectId,
            projectName
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send invite');
        }

        return { success: true, email: invite.email };
      } catch (err) {
        console.error(`Failed to invite ${invite.email}:`, err);
        return { success: false, email: invite.email, error: err };
      }
    });

    const results = await Promise.all(invitePromises);
    const failed = results.filter(r => !r.success);
    
    if (failed.length > 0) {
      console.warn(`Failed to send ${failed.length} invites:`, failed);
      alert(`Project created! However, ${failed.length} invitation(s) failed to send. You can invite them from the Share menu.`);
    } else if (pendingInvites.length > 0) {
      alert(`Project created and ${pendingInvites.length} invitation(s) sent!`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!projectData.name.trim()) {
      alert('Project name is required.');
      return;
    }

    if (selectedImages.length === 0) {
      alert('Please select at least one image file.');
      return;
    }
    
    try {
      setIsProcessing(true);

      // Upload all images to S3
      console.log(`Uploading ${selectedImages.length} images...`);
      const uploadedImages: Array<{
        imageUrl: string;
        imageFilename: string;
        imageWidth: number;
        imageHeight: number;
      }> = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const imageData = selectedImages[i];
        setUploadProgress({
          current: i + 1,
          total: selectedImages.length,
          fileName: imageData.file.name
        });

        const uploadResult = await s3UploadService.uploadImage(imageData.file);
        
        if (!uploadResult.success || !uploadResult.imageUrl) {
          throw new Error(uploadResult.error || `Failed to upload ${imageData.file.name}`);
        }

        uploadedImages.push({
          imageUrl: uploadResult.imageUrl,
          imageFilename: imageData.file.name,
          imageWidth: imageData.width,
          imageHeight: imageData.height
        });
      }

      console.log('All images uploaded to S3 successfully');

      // Prepare project data with first image and additional images
      const finalProjectData: ProjectData = {
        ...projectData,
        imageUrl: uploadedImages[0].imageUrl,
        imageFilename: uploadedImages[0].imageFilename,
        width: uploadedImages[0].imageWidth,
        height: uploadedImages[0].imageHeight,
        additionalImages: uploadedImages.slice(1), // All images except the first
        inviteEmails: pendingInvites.map(invite => invite.email) // Include emails for backend
      };
      
      // Call the parent's create project handler
      await onCreateProject(finalProjectData);
      
      // Note: If your onCreateProject returns the created project with an ID,
      // you can send invites here. Otherwise, handle invites in the parent component.
      // Example:
      // const createdProject = await onCreateProject(finalProjectData);
      // if (createdProject && createdProject._id && pendingInvites.length > 0) {
      //   await sendInvites(createdProject._id, projectData.name);
      // }
      
      handleClose();
    } catch (err) {
      console.error('Error creating project:', err);
      alert(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
    }
  };

  const handleClose = () => {
    // Cleanup preview URLs to prevent memory leaks
    selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setSelectedImages([]);
    resetUpload();
    
    // Reset form data
    setProjectData({
      name: "",
      width: 1920,
      height: 1080,
      teamMembers: [],
    });
    
    // Reset team invites
    setPendingInvites([]);
    setEmail("");
    setError(null);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">Create Project</h2>
          <button
            onClick={handleClose}
            className="text-black rounded p-1 bg-transparent hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
              <path d="M19.5 6.5L6.5 19.5M6.5 6.5L19.5 19.5" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {(uploadError || error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-600 text-sm">
                <strong>Error:</strong> {uploadError || error}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="font-inter font-bold text-lg text-black mb-2 block">
              Upload Images
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
              {selectedImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.previewUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                  </p>
                  <label className="cursor-pointer">
                    <span className="bg-green-600 text-white mt-4 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block">
                      Add More Images
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,application/zip,.zip"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isProcessing}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-gray-400 text-sm">
                    Add images or a zip file here
                  </div>
                  <label className="cursor-pointer">
                    <span className="bg-green-600 text-white mt-4 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,application/zip,.zip"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isProcessing}
                    />
                  </label>
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
              disabled={isProcessing}
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
                disabled={isProcessing}
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
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Team Members Section */}
          <div>
            <label className="font-inter font-bold text-lg text-black mb-2 block">
              Invite Team Members
            </label>
            <p className="text-gray-500 font-inter text-sm mb-3">
              Invite teammates to collaborate on this project
            </p>
            
            {/* Email Input */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTeamMember();
                    }
                  }}
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-inter text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isProcessing}
                />
              </div>
              <button
                type="button"
                onClick={handleAddTeamMember}
                disabled={!email.trim() || isProcessing}
                className="px-5 py-2 bg-green-600 text-white text-sm font-inter rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Pending Invites List */}
            {pendingInvites.length > 0 && (
              <div className="space-y-2 mt-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.email} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-inter font-medium"
                      style={{ backgroundColor: invite.color }}
                    >
                      {invite.initial}
                    </div>
                    <div className="flex-1">
                      <span className="font-inter text-sm text-black">{invite.email}</span>
                      <span className="text-xs text-gray-500 ml-2">Pending</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(invite.email)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      disabled={isProcessing}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || selectedImages.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
      {/* Upload Progress Overlay */}
      {isProcessing && uploadProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-gray-900 font-medium">
                  {isProcessing && !uploadProgress ? 'Processing files...' : 'Uploading images...'}
                </span>
              </div>
              {uploadProgress && (
                <>
                  <div className="text-sm text-gray-600">
                    {uploadProgress.current} of {uploadProgress.total}: {uploadProgress.fileName}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}