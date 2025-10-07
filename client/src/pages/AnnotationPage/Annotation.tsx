import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { LiveblocksProvider, RoomProvider, useOthers, useMyPresence } from "@liveblocks/react";
import { ActiveFile, Layer, ToolbarTool, ImageData } from "./types";
import { Move, Search, Maximize, Square, Minus, Brush, Type, Pipette, Wand2, Pen } from "lucide-react";
import { projectService } from "../../services/projectService";
import type { Annotation as AnnotationType } from "./types";
import ShareProject from "../../components/modals/ShareProjectModal/ShareProject";
import Export from "../../components/modals/ExportModal/Export";
import LeftToolbar from "./components/LeftToolbar";
import CanvasArea from "./components/CanvasArea";
import LayersPanel from "./components/LayersPanel";
import TopNav from "./components/TopNav";
import Cursor from "../../components/ui/cursor";
import "../../styles/globals.css";
import { s3UploadService } from "../../services/s3UploadService";
import { annotationService } from '../../services/annotationService';
import ManageLabels from "../../components/modals/ManageLabelsModal/ManageLabels";
import LabelSelector from "./components/LabelSelector";
import { labelService, Label } from '../../services/labelService';  
import { getAnonymousName } from "../../utils/mockData";

// Define the types for your presence data
type CursorPosition = {
  x: number;
  y: number;
};

type Presence = {
  cursor: CursorPosition | null;
  selectedTool?: string;
  selectedColor?: string;
};

// Declare module to extend Liveblocks types
declare global {
  interface Liveblocks {
    Presence: Presence;
    Storage: {};
    UserMeta: {};
    RoomEvent: {};
  }
}

const CURSOR_COLORS = [
  "#E57373",
  "#9575CD", 
  "#4FC3F7",
  "#81C784",
  // "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

interface ProjectData {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  images: Array<{
    _id: string;
    filename: string;
    url: string;
    width: number;
    height: number;
    uploadedAt: string;
  }>;
  collaborators: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: string;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function Annotation() {
  const { id: projectId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();

  const [isUploadingImage, setIsUploadingImage] = useState(false);
    
  // Project data state
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Active files based on project images
  const [activeFiles, setActiveFiles] = useState<ActiveFile[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchLayers, setSearchLayers] = useState("");
  const [selectedTool, setSelectedTool] = useState("move");
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [annotations, setAnnotations] = useState<AnnotationType[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Color palette state
  const colorPalette = ["#3B3B3B", "#5CBF7D"];
  const [selectedColor, setSelectedColor] = useState<string>(colorPalette[0]);

  const CURRENT_USER_ID = "68b6f01c33861a8d7edf5ad3";

  // State for current image and label
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [currentLabelId, setCurrentLabelId] = useState<string | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [showManageLabelsModal, setShowManageLabelsModal] = useState(false);

  // Load project data on mount
  useEffect(() => {
    if (projectId) {
      loadProject();
      loadLabels();
    }
  }, [projectId]);

  useEffect(() => {
    const activeFile = activeFiles.find(file => file.isActive);
    if (activeFile && activeFile.id !== currentImageId) {
      setCurrentImageId(activeFile.id);
    }
  }, [activeFiles, currentImageId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('Loading project with ID:', projectId);
      const projectData = await projectService.getProject(projectId);
      console.log('Project data loaded:', projectData);
      setProject(projectData);

      // Set up active files based on project images
      if (projectData.images && projectData.images.length > 0) {
        const files: ActiveFile[] = projectData.images.map((image, index) => ({
          id: image._id,
          name: image.filename,
          isActive: index === 0, // First image is active by default
          imageUrl: image.url,
          width: image.width,
          height: image.height
        }));
        setActiveFiles(files);
      } else {
        // No images in project
        setActiveFiles([]);
      }

      // Set first image as current if images exist
      if (projectData.images && projectData.images.length > 0) {
        setCurrentImageId(projectData.images[0]._id);
      }

    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadLabels = async () => {
    if (!projectId) return;
    
    try {
      const fetchedLabels = await labelService.getLabelsForProject(projectId);
      setLabels(fetchedLabels);
      
      // Set first label as default if available and none is selected
      if (fetchedLabels.length > 0 && !currentLabelId) {
        setCurrentLabelId(fetchedLabels[0]._id);
        console.log('Auto-selected first label:', fetchedLabels[0].name);
      } else if (fetchedLabels.length === 0) {
        console.warn('No labels found. Create labels before annotating.');
      }
    } catch (err) {
      console.error('Failed to load labels:', err);
    }
  };
  
  // Load annotations from database
  const loadAnnotationsForImage = async (imageId: string) => {
    try {
      console.log('Loading annotations for image:', imageId);
      const fetchedAnnotations = await annotationService.getAnnotationsForImage(imageId);
      
      // Convert backend format to your frontend annotation format
      const convertedAnnotations: AnnotationType[] = fetchedAnnotations.map(ann => {
        let properties: any = {
          style: {
            color: ann.labelId.colour
          }
        };

        // Convert backend coordinates to frontend format
        if (ann.shapeData.type === 'rectangle') {
          properties.position = {
            x: ann.shapeData.coordinates.x,
            y: ann.shapeData.coordinates.y
          };
          properties.width = ann.shapeData.coordinates.width;
          properties.height = ann.shapeData.coordinates.height;
        } else if (ann.shapeData.type === 'polygon' || ann.shapeData.type === 'line') {
          properties.points = ann.shapeData.coordinates.points.map((p: number[]) => ({
            x: p[0],
            y: p[1]
          }));
        } else if (ann.shapeData.type === 'point') {
          properties.position = {
            x: ann.shapeData.coordinates.x,
            y: ann.shapeData.coordinates.y
          };
        } else if (ann.shapeData.type === 'circle') {
          properties.position = {
            x: ann.shapeData.coordinates.x,
            y: ann.shapeData.coordinates.y
          };
          properties.radius = ann.shapeData.coordinates.radius;
        }

        return {
          id: ann._id,
          type: ann.shapeData.type as any,
          properties: properties,
          labelId: ann.labelId._id,
          labelName: ann.labelId.name,
          createdBy: ann.createdBy._id
        } as AnnotationType;
      });
      
      setAnnotations(convertedAnnotations);
      console.log(`Loaded ${convertedAnnotations.length} annotations`);
      
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  };

  // Load annotations when currentImageId changes
  useEffect(() => {
    if (currentImageId) {
      loadAnnotationsForImage(currentImageId);
    }
  }, [currentImageId]);

  // Show helpful message when no labels exist
  useEffect(() => {
    if (!loading && labels.length === 0 && annotations.length === 0 && project) {
      setTimeout(() => {
        alert('Welcome! Please create labels first using the "Manage Labels" button before annotating.');
      }, 500);
    }
  }, [loading, labels.length, annotations.length, project]);

  // Save annotation to database
  const saveAnnotationToDatabase = async (annotation: AnnotationType) => {
    try {
      if (!currentImageId || !currentLabelId) {
        console.error('Cannot save: No image or label selected');
        alert('Please select a label before creating annotations. Click "Manage Labels" to create labels first.');
        // Remove the unsaved annotation from UI
        setAnnotations(prev => prev.filter(ann => ann.id !== annotation.id));
        return;
      }

      // Map your frontend annotation format to backend format
      let coordinates: any;
      
      if (annotation.type === 'rectangle' && annotation.properties.position) {
        // Convert frontend rectangle format to backend format
        coordinates = {
          x: annotation.properties.position.x,
          y: annotation.properties.position.y,
          width: annotation.properties.width || 0,
          height: annotation.properties.height || 0
        };
      } else if (annotation.type === 'polygon' && annotation.properties.points) {
        // Convert frontend polygon format to backend format
        coordinates = {
          points: annotation.properties.points.map((p: any) => [p.x, p.y])
        };
      } else if (annotation.type === 'line' && annotation.properties.points) {
        // Convert frontend line format to backend format
        coordinates = {
          points: annotation.properties.points.map((p: any) => [p.x, p.y])
        };
      } else {
        console.warn('Unknown annotation type or missing properties:', annotation);
        return;
      }

      const shapeData = {
        type: annotation.type,
        coordinates: coordinates,
        isNormalized: false
      };

      const savedAnnotation = await annotationService.createAnnotation({
        imageId: currentImageId,
        labelId: currentLabelId,
        createdBy: CURRENT_USER_ID,
        shapeData
      });

      console.log('Annotation saved to database:', savedAnnotation);
      
      // Update the local annotation with the database ID and server data
      setAnnotations(prev => 
        prev.map(ann => {
          if (ann.id === annotation.id) {
            return {
              ...ann,
              id: savedAnnotation._id,
              labelId: savedAnnotation.labelId._id,
              labelName: savedAnnotation.labelId.name,
              createdBy: savedAnnotation.createdBy._id
            };
          }
          return ann;
        })
      );
      
    } catch (error) {
      console.error('Failed to save annotation:', error);
    }
  };

  const handleAddImage = async () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,application/zip,.zip';
    input.multiple = true; // Allow multiple file selection
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      
      if (!files || files.length === 0) return;

      try {
        setIsUploadingImage(true);

        // Separate zip files and image files
        const zipFiles: File[] = [];
        const imageFiles: File[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
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
          return;
        }

        // Validate all files
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        for (const file of imageFiles) {
          // Check if file type starts with 'image/' for more lenient validation
          if (!file.type.startsWith('image/') && !validTypes.includes(file.type)) {
            alert(`Invalid file type: ${file.name} (${file.type}). Please upload only image files.`);
            return;
          }
        }

        console.log(`Uploading ${imageFiles.length} images...`);

        // Upload all images to S3
        const uploadResults = await s3UploadService.uploadMultipleImages(
          imageFiles,
          (fileIndex, fileName, progress) => {
            console.log(`Uploading ${fileName} (${fileIndex + 1}/${imageFiles.length}): ${progress.toFixed(1)}%`);
          }
        );

        if (!uploadResults.success) {
          const failedUploads = uploadResults.results
            .filter(r => !r.success)
            .map(r => r.error)
            .join('\n');
          throw new Error(`Some uploads failed:\n${failedUploads}`);
        }

        console.log('All images uploaded to S3 successfully');

        // Get dimensions for all images
        const imagesData: ImageData[] = await Promise.all(
          imageFiles.map(async (file, index) => {
            const uploadResult = uploadResults.results[index];
            
            // Get image dimensions
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = URL.createObjectURL(file);
            });

            return {
              imageUrl: uploadResult.imageUrl!,
              imageFilename: file.name,
              imageWidth: img.naturalWidth,
              imageHeight: img.naturalHeight
            };
          })
        );

        console.log('Adding all images to project...');

        // Batch add all images to project via backend
        if (projectId) {
          const updatedProject = await projectService.batchAddImagesToProject(projectId, imagesData);
          
          // Update local project state
          setProject(updatedProject);

          // Create new active files for all added images
          const newImages = updatedProject.images.slice(-imagesData.length);
          const newActiveFiles: ActiveFile[] = newImages.map((image, index) => ({
            id: image._id,
            name: image.filename,
            isActive: index === 0, // Only first image is active
            imageUrl: image.url,
            width: image.width,
            height: image.height
          }));

          // Set all existing files to inactive, then add new files
          setActiveFiles(prev => [
            ...prev.map(file => ({ ...file, isActive: false })),
            ...newActiveFiles
          ]);

          console.log(`Successfully added ${imagesData.length} images!`);
          // REMOVED: alert(`Successfully uploaded ${imagesData.length} image(s)`);
        }
      } catch (err) {
        console.error('Error uploading images:', err);
        alert(err instanceof Error ? err.message : 'Failed to upload images');
      } finally {
        setIsUploadingImage(false);
      }
    };

    input.click();
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    // Update presence to share selected tool with others
    updateMyPresence({ 
      cursor,
      selectedTool: toolId,
      selectedColor 
    });
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Update presence to share selected color with others
    updateMyPresence({ 
      cursor,
      selectedTool,
      selectedColor: color 
    });
  };

  const handleCanvasZoom = (direction: "in" | "out" | "reset") => {
    setCanvasZoom(prev => {
      if (direction === "in") return Math.min(prev + 25, 200);
      if (direction === "out") return Math.max(prev - 25, 25);
      return 100; // reset
    });
  };

  // Handle mouse movement to update cursor position
  const handlePointerMove = (event: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    updateMyPresence({
      cursor: {
        x: Math.round(event.clientX - rect.left),
        y: Math.round(event.clientY - rect.top),
      },
      selectedTool,
      selectedColor,
    });
  };


  // Handle mouse leave to hide cursor
  const handlePointerLeave = () => {
    updateMyPresence({ 
      cursor: null,
      selectedTool,
      selectedColor 
    });
  };

  const toolbarTools: ToolbarTool[] = [
    {
      id: "move",
      isSelected: selectedTool === "move",
      icon: <Move className={selectedTool === "move" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "search",
      isSelected: selectedTool === "search",
      icon: <Search className={selectedTool === "search" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "marquee",
      isSelected: selectedTool === "marquee",
      icon: <Maximize className={selectedTool === "marquee" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "rectangle",
      isSelected: selectedTool === "rectangle",
      icon: <Square className={selectedTool === "rectangle" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "line",
      isSelected: selectedTool === "line",
      icon: <Minus className={selectedTool === "line" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "brush",
      isSelected: selectedTool === "brush",
      icon: <Brush className={selectedTool === "brush" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "edit",
      isSelected: selectedTool === "edit",
      icon: <Wand2 className={selectedTool === "edit" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "text",
      isSelected: selectedTool === "text",
      icon: <Type className={selectedTool === "text" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "eyedropper",
      isSelected: selectedTool === "eyedropper",
      icon: <Pipette className={selectedTool === "eyedropper" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
    {
      id: "pen",
      isSelected: selectedTool === "pen",
      icon: <Pen className={selectedTool === "pen" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
    },
  ];

  // Dynamic layers - start with empty and allow users to create as needed
  const layers: Layer[] = [
    { id: "1", name: "Annotations", visible: true, locked: false },
  ];

  const closeFile = (fileId: string) => {
    setActiveFiles(prev => {
      const newFiles = prev.filter(file => file.id !== fileId);
      // If we closed the active file, make the first remaining file active
      if (newFiles.length > 0 && !newFiles.some(f => f.isActive)) {
        newFiles[0].isActive = true;
      }
      return newFiles;
    });
  };

  const switchFile = (fileId: string) => {
    setActiveFiles(prev =>
      prev.map(file => ({ ...file, isActive: file.id === fileId }))
    );
  };

  // Get current active file
  const activeFile = activeFiles.find(file => file.isActive);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">Loading Project...</div>
          <div className="text-gray-500">Please wait while we load your annotation project.</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-2">Error Loading Project</div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={loadProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No project found
  if (!project) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</div>
          <div className="text-gray-500">The requested project could not be found.</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen bg-white flex flex-col "
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <TopNav
        projectName={project.name}
        activeFiles={activeFiles}
        showShareModal={showShareModal}
        showExportModal={showExportModal}
        showUserDropdown={showUserDropdown}
        showFileMenu={showFileMenu}
        showEditMenu={showEditMenu}
        showViewMenu={showViewMenu}
        onSwitchFile={switchFile}
        onCloseFile={closeFile}
        onShowShareModal={() => setShowShareModal(true)}
        onShowExportModal={() => setShowExportModal(true)}
        onToggleUserDropdown={() => setShowUserDropdown(!showUserDropdown)}
        onToggleFileMenu={() => setShowFileMenu(!showFileMenu)}
        onToggleEditMenu={() => setShowEditMenu(!showEditMenu)}
        onToggleViewMenu={() => setShowViewMenu(!showViewMenu)}
        onCanvasZoom={handleCanvasZoom}
        onAddImage={handleAddImage}
        others={others}
        cursorColors={CURSOR_COLORS}
      />

      {/* Label Selector */}
      <LabelSelector
        labels={labels}
        selectedLabelId={currentLabelId}
        onSelectLabel={setCurrentLabelId}
        onManageLabels={() => setShowManageLabelsModal(true)}
      />

      {/* Main Content */}
      <div className="flex flex-1 relative" ref={containerRef}>
        <LeftToolbar
          tools={toolbarTools}
          selectedColor={selectedColor}
          onSelectColor={handleColorSelect}
          onSelectTool={handleToolSelect}
        />
        <CanvasArea
          zoomPercent={canvasZoom}
          onZoom={handleCanvasZoom}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          annotations={annotations}
          setAnnotations={setAnnotations}
          currentAnnotation={currentAnnotation}
          setCurrentAnnotation={setCurrentAnnotation}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          selectedAnnotationId={selectedAnnotationId}
          setSelectedAnnotationId={setSelectedAnnotationId}
          projectImage={activeFile} // Pass the active file/image data
          onAnnotationCreated={saveAnnotationToDatabase}
        />
        <LayersPanel
          search={searchLayers}
          onSearchChange={setSearchLayers}
          layers={layers}
        />

        {/* Other users' cursors */}
        {others.map(({ connectionId, presence }) => {
          if (!presence?.cursor) return null;
          
          const anonymousName = getAnonymousName(connectionId);
          const cursorColor = CURSOR_COLORS[connectionId % CURSOR_COLORS.length];
          
          return (
            <div key={`cursor-${connectionId}`} className="absolute pointer-events-none z-50">
              <Cursor
                color={cursorColor}
                x={presence.cursor.x}
                y={presence.cursor.y}
              />
              {/* Figma-style name label */}
              <div 
                className="absolute text-white text-xs px-2 py-1 rounded whitespace-nowrap font-medium"
                style={{
                  left: presence.cursor.x,
                  top: presence.cursor.y + 20,
                  backgroundColor: cursorColor,
                }}
              >
                {anonymousName}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <ShareProject
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={project._id}
        projectName={project.name}
      />
      <Export
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectData={{
          name: project.name,
          annotations: annotations,
          image: activeFile?.imageUrl || ""
        }}
      />
      <ManageLabels
        isOpen={showManageLabelsModal}
        onClose={() => setShowManageLabelsModal(false)}
        projectId={project._id}
        onLabelsChanged={loadLabels}
      />
      {/* Upload Loading Indicator */}
      {isUploadingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-900 font-medium">Uploading image...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnnotationCanvas() {
  // Generate a unique room ID based on project ID or use a default
  const { id: projectId } = useParams();
  const roomId = projectId ? `annotation-${projectId}` : "annotation-default";

  return (
    <LiveblocksProvider publicApiKey="pk_dev_eH0jmBFlrKAt3C8vX8ZZF53cmXb5W6XoCyGx2A9NGCZV3-v2P-gqUav-vAvszF1x">
      <RoomProvider
        id={roomId}
        initialPresence={{ 
          cursor: null,
          selectedTool: "move",
          selectedColor: "#3B3B3B"
        }}
      >
        <Annotation />
      </RoomProvider>
    </LiveblocksProvider>
  );
}