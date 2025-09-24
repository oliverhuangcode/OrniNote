// client/src/pages/AnnotationPage/Annotation.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ShareProject from "../../components/modals/ShareProjectModal/ShareProject";
import Export from "../../components/modals/ExportModal/Export";
import LeftToolbar from "./components/LeftToolbar";
import CanvasArea from "./components/CanvasArea";
import LayersPanel from "./components/LayersPanel";
import TopNav from "./components/TopNav";
import { ActiveFile, Layer, ToolbarTool } from "./types";
import { Move, Search, Maximize, Square, Minus, Brush, Type, Pipette, Wand2 } from "lucide-react";
import type { Annotation as AnnotationType } from "./types";
import { projectService } from "../../services/projectService";

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

  // Load project data on mount
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

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

    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleCanvasZoom = (direction: "in" | "out" | "reset") => {
    setCanvasZoom(prev => {
      if (direction === "in") return Math.min(prev + 25, 200);
      if (direction === "out") return Math.max(prev - 25, 25);
      return 100; // reset
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
      id: "expand",
      isSelected: selectedTool === "expand",
      icon: <Maximize className={selectedTool === "expand" ? "text-white" : "text-black"} strokeWidth={2.5} size={28} />,
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
    <div className="h-screen bg-white flex flex-col">
      <TopNav
        projectId={projectId}
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
      />

      {/* Main Content */}
      <div className="flex flex-1">
        <LeftToolbar
          tools={toolbarTools}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
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
        />
        <LayersPanel
          search={searchLayers}
          onSearchChange={setSearchLayers}
          layers={layers}
        />
      </div>

      {/* Modals */}
      <ShareProject
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectName={project.name}
      />
      <Export
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectData={{
          name: project.name,
          annotations: {},
          image: activeFile?.imageUrl || ""
        }}
      />
    </div>
  );
}