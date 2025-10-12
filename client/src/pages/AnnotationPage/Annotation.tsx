import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { LiveblocksProvider, RoomProvider, useOthers, useMyPresence } from "@liveblocks/react";
import { ActiveFile, Layer, ToolbarTool } from "./types";
import { Move, Search, Maximize, Square, Minus, Brush, Type, Pipette, Wand2, Pen } from "lucide-react";
import { projectService } from "../../services/projectService";
import { useAnnotationStorage } from "../../hooks/useAnnotationStorage";
import { MongoAnnotation, MongoLabel } from "../../services/annotationExportService";
import type { Annotation as AnnotationType } from "./types";
import ShareProject from "../../components/modals/ShareProjectModal/ShareProject";
import Export from "../../components/modals/ExportModal/Export";
import LeftToolbar from "./components/LeftToolbar";
import CanvasArea from "./components/CanvasArea";
import LabelPanel from "./components/LabelPanel";
import TopNav from "./components/TopNav";
import Cursor from "../../components/ui/cursor";
import "../../styles/globals.css";

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
  
  // Project data state
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Active files based on project images
  const [activeFiles, setActiveFiles] = useState<ActiveFile[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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
  
  // Labels and MongoDB annotations
  const [labels, setLabels] = useState<MongoLabel[]>([]);
  const [currentLabelId, setCurrentLabelId] = useState<string>('');
  const [mongoAnnotations, setMongoAnnotations] = useState<MongoAnnotation[]>([]);

  // Color palette state
  const colorPalette = ["#3B3B3B", "#5CBF7D"];
  const [selectedColor, setSelectedColor] = useState<string>(colorPalette[0]);

  // Get current user ID (you'll need to implement this based on your auth system)
  const currentUserId = project?.owner._id || ''; // Replace with actual user ID from auth context

  // Initialize annotation storage hook
  const annotationStorage = useAnnotationStorage({
    imageId: activeFiles.find(f => f.isActive)?._id || '',
    projectId: projectId || '',
    userId: currentUserId,
    apiBaseUrl: '/api'
  });

  // Load project data on mount
  useEffect(() => {
    if (projectId) {
      loadProject();
      loadLabels();
    }
  }, [projectId]);

  // Load annotations when active file changes
  useEffect(() => {
    const activeFile = activeFiles.find(f => f.isActive);
    if (activeFile?._id) {
      loadAnnotationsForImage(activeFile._id);
    }
  }, [activeFiles]);

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
          _id: image._id,
          id: image._id,
          name: image.filename,
          isActive: index === 0,
          imageUrl: image.url,
          width: image.width,
          height: image.height
        }));
        setActiveFiles(files);
      } else {
        setActiveFiles([]);
      }

    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  // In Annotation.tsx, add this useEffect after your other effects (around line 148):
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedAnnotationId) {
      handleAnnotationDelete(selectedAnnotationId);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedAnnotationId]);

  const loadLabels = async () => {
    try {
      const response = await fetch(`/api/labels?projectId=${projectId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const labelsData = await response.json();
        setLabels(labelsData);
        if (labelsData.length > 0) {
          setCurrentLabelId(labelsData[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load labels:', err);
    }
  };

  const loadAnnotationsForImage = async (imageId: string) => {
    try {
      const mongoAnns = await annotationStorage.loadAnnotations();
      setMongoAnnotations(mongoAnns);
      
      // Convert MongoDB annotations to frontend format
      const frontendAnns = convertMongoToFrontend(mongoAnns);
      setAnnotations(frontendAnns);
    } catch (err) {
      console.error('Failed to load annotations:', err);
    }
  };

  // Convert MongoDB annotation to frontend format
  const convertMongoToFrontend = (mongoAnns: MongoAnnotation[]): AnnotationType[] => {
    return mongoAnns.map(ann => {
      const label = labels.find(l => l._id === ann.labelId);
      const coords = ann.shapeData.coordinates;
      
      const frontendAnn: AnnotationType = {
        id: ann._id,
        type: ann.shapeData.type as any,
        properties: {
          style: {
            color: label?.colour || selectedColor,
            strokeWidth: 2
          }
        }
      };

      if (ann.shapeData.type === 'rectangle') {
        if (Array.isArray(coords[0])) {
          const [[x, y], [w, h]] = coords as number[][];
          frontendAnn.properties.position = { x, y };
          frontendAnn.properties.width = w;
          frontendAnn.properties.height = h;
        } else {
          const [x, y, w, h] = coords as number[];
          frontendAnn.properties.position = { x, y };
          frontendAnn.properties.width = w;
          frontendAnn.properties.height = h;
        }
      } else if (ann.shapeData.type === 'polygon' || ann.shapeData.type === 'line') {
        frontendAnn.properties.points = (coords as number[][]).map(([x, y]) => ({ x, y }));
      } else if (ann.shapeData.type === 'point') {
        const [x, y] = coords as number[];
        frontendAnn.properties.position = { x, y };
      }

      return frontendAnn;
    });
  };

  // Save annotation to MongoDB
  const handleAnnotationComplete = async (newAnnotation: AnnotationType) => {
    if (!currentLabelId) {
      alert('Please select a label before creating annotations');
      return;
    }

    const savedAnnotation = await annotationStorage.saveAnnotation(
      newAnnotation,
      currentLabelId
    );

    if (savedAnnotation) {
      setAnnotations(prev => [...(prev || []), {
  ...newAnnotation,
  id: savedAnnotation._id
}]);
setMongoAnnotations(prev => [...(prev || []), savedAnnotation]);
    } else if (annotationStorage.error) {
      alert(`Failed to save annotation: ${annotationStorage.error}`);
    }
  };

  // Update annotation in MongoDB
  const handleAnnotationUpdate = async (annotationId: string, updatedAnnotation: AnnotationType) => {
    const success = await annotationStorage.updateAnnotation(
      annotationId,
      updatedAnnotation,
      currentLabelId
    );

    if (success) {
      setAnnotations(prev =>
  (prev || []).map(ann => ann.id === annotationId ? updatedAnnotation : ann)
);
      // Reload MongoDB annotations
      const activeFile = activeFiles.find(f => f.isActive);
      if (activeFile?._id) {
        loadAnnotationsForImage(activeFile._id);
      }
    } else if (annotationStorage.error) {
      alert(`Failed to update annotation: ${annotationStorage.error}`);
    }
  };

  // Delete annotation from MongoDB
  const handleAnnotationDelete = async (annotationId: string) => {
    const success = await annotationStorage.deleteAnnotation(annotationId);

    if (success) {
      setAnnotations(prev => (prev || []).filter(ann => ann.id !== annotationId));
      setMongoAnnotations(prev => (prev || []).filter(ann => ann._id !== annotationId));
    } else if (annotationStorage.error) {
      alert(`Failed to delete annotation: ${annotationStorage.error}`);
    }
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    updateMyPresence({ 
      cursor,
      selectedTool: toolId,
      selectedColor 
    });
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
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
      return 100;
    });
  };

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

  const handlePointerLeave = () => {
    updateMyPresence({ 
      cursor: null,
      selectedTool,
      selectedColor 
    });
  };

  // Enhanced setAnnotations that saves to MongoDB
  const handleSetAnnotations = (newAnnotations: AnnotationType[] | ((prev: AnnotationType[]) => AnnotationType[])) => {
  setAnnotations(newAnnotations);
};

  const handleCreateLabel = async (name: string, color: string) => {
  try {
    const response = await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        projectId: projectId,
        name,
        colour: color
      })
    });
    
    if (response.ok) {
      const newLabel = await response.json();
      setLabels(prev => [...(prev || []), newLabel]);
      setCurrentLabelId(newLabel._id);
    }
  } catch (err) {
    console.error('Failed to create label:', err);
  }
};

const handleUpdateLabel = async (labelId: string, name: string, color: string) => {
  try {
    const response = await fetch(`/api/labels/${labelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, colour: color })
    });
    
    if (response.ok) {
      const updated = await response.json();
      setLabels(prev => (prev || []).map(l => l._id === labelId ? updated : l));
    }
  } catch (err) {
    console.error('Failed to update label:', err);
  }
};

const handleDeleteLabel = async (labelId: string) => {
  try {
    const response = await fetch(`/api/labels/${labelId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      setLabels(prev => (prev || []).filter(l => l._id !== labelId));
      if (currentLabelId === labelId) {
        setCurrentLabelId(labels[0]?._id || '');
      }
    }
  } catch (err) {
    console.error('Failed to delete label:', err);
  }
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

  const closeFile = (fileId: string) => {
    setActiveFiles(prev => {
      const newFiles = prev.filter(file => file.id !== fileId);
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

  const activeFile = activeFiles.find(file => file.isActive);

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
      className="h-screen bg-white flex flex-col"
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
        others={others}
        cursorColors={CURSOR_COLORS}
      />

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
          setAnnotations={handleSetAnnotations}
          currentAnnotation={currentAnnotation}
          setCurrentAnnotation={setCurrentAnnotation}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          selectedAnnotationId={selectedAnnotationId}
          setSelectedAnnotationId={setSelectedAnnotationId}
          projectImage={activeFile}
        />
        <LabelPanel
  labels={labels}
  selectedLabelId={currentLabelId}
  onSelectLabel={setCurrentLabelId}
  onCreateLabel={handleCreateLabel}
  onUpdateLabel={handleUpdateLabel}
  onDeleteLabel={handleDeleteLabel}
/>

        {others.map(({ connectionId, presence }) => {
          if (!presence?.cursor) return null;
          
          return (
            <div key={`cursor-${connectionId}`} className="absolute pointer-events-none z-50">
              <Cursor
                color={CURSOR_COLORS[connectionId % CURSOR_COLORS.length]}
                x={presence.cursor.x}
                y={presence.cursor.y}
              />
              {presence.selectedTool && (
                <div 
                  className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
                  style={{
                    left: presence.cursor.x + 20,
                    top: presence.cursor.y - 30
                  }}
                >
                  Tool: {presence.selectedTool}
                  {presence.selectedColor && (
                    <span 
                      className="inline-block w-3 h-3 rounded-sm ml-2 border border-white/30"
                      style={{ backgroundColor: presence.selectedColor }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
    annotations: mongoAnnotations,
    labels: labels,
    image: activeFile && activeFile.imageUrl ? {
      url: activeFile.imageUrl,
      width: activeFile.width || 800,
      height: activeFile.height || 600
    } : undefined
  }}
/>
    </div>
  );
}

export function AnnotationCanvas() {
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