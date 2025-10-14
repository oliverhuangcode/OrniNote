import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LiveblocksProvider,
  RoomProvider,
  useOthers,
  useMyPresence,
} from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";
import { ToolbarTool } from "./types";
import {
  Move,
  Search,
  Maximize,
  Square,
  Minus,
  Brush,
  Type,
  Pipette,
  Wand2,
  Pen,
} from "lucide-react";
import { projectService } from "../../services/projectService";
import type { Annotation as AnnotationType } from "./types";
import ShareProject from "../../components/modals/ShareProjectModal/ShareProject";
import Export from "../../components/modals/ExportModal/Export";
import CreateProject from "../../components/modals/CreateProjectModal/CreateProject";
import OpenProject from "../../components/modals/OpenProjectModal/OpenProject";
import Help from "../../components/modals/HelpModal/Help";
import LeftToolbar from "./components/LeftToolbar";
import CanvasArea from "./components/CanvasArea";
import LabelPanel from "./components/LabelPanel";
import TopNav from "./components/TopNav";
import Cursor from "../../components/ui/cursor";
import "../../styles/globals.css";
import ManageLabels from "../../components/modals/ManageLabelsModal/ManageLabels";
import { useAuth } from "../../contexts/authContext";
import { useProject } from "./hooks/useProject";
import { useLabels } from "./hooks/useLabels";
import { useAnnotations } from "./hooks/useAnnotations";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { ProjectData } from "./types";

// Types for presence data
type CursorPosition = {
  x: number;
  y: number;
};

type Presence = {
  cursor: CursorPosition | null;
  userInfo: {
    name: string;
    email: string;
  } | null;
};

// Update Liveblocks types to just store annotation IDs
declare global {
  interface Liveblocks {
    Presence: Presence;
    Storage: {
      annotationIds: LiveList<string>;
    };
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

export default function Annotation() {
  const { id: projectId } = useParams();
  const { user, signout } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const navigate = useNavigate();

  // Custom hooks
  const {
    project,
    loading,
    error,
    activeFiles,
    isUploadingImage,
    currentImageId,
    loadProject,
    handleAddImage,
    closeFile,
    switchFile,
    activeFile,
  } = useProject();

  const {
    labels,
    currentLabelId,
    selectedColor,
    setSelectedColor,
    handleLabelSelect,
    handleLabelsChanged,
    advanceToNextLabel,
  } = useLabels(projectId);

  const {
    annotations,
    setAnnotations,
    allAnnotations,
    currentAnnotation,
    setCurrentAnnotation,
    isDrawing,
    setIsDrawing,
    selectedAnnotationId,
    setSelectedAnnotationId,
    saveAnnotationToDatabase,
  } = useAnnotations(projectId, currentImageId, user);

  const {
    updateAnnotations,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
  } = useUndoRedo(annotations, setAnnotations);

  // Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showManageLabelsModal, setShowManageLabelsModal] = useState(false);
  
  // UI states
  const [showGrid, setShowGrid] = useState(false);
  const [selectedTool, setSelectedTool] = useState("move");
  const [canvasZoom, setCanvasZoom] = useState(100);

  // Color palette
  const colorPalette = ["#3B3B3B", "#5CBF7D"];

  // Load project data on mount
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // Handle mouse movement to update cursor position
  const handlePointerMove = (event: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    updateMyPresence({
      cursor: {
        x: Math.round(event.clientX - rect.left),
        y: Math.round(event.clientY - rect.top),
      },
    });
  };

  const handlePointerLeave = () => {
    updateMyPresence({
      cursor: null,
    });
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleCanvasZoom = (direction: "in" | "out" | "reset") => {
    setCanvasZoom((prev) => {
      if (direction === "in") return Math.min(prev + 25, 200);
      if (direction === "out") return Math.max(prev - 25, 25);
      return 100;
    });
  };

  const handleGrid = () => {
    setShowGrid((prev) => !prev);
  };

  // Handle project creation
  const handleCreateProject = async (projectData: ProjectData) => {
    try {
      if (!user) {
        throw new Error("User not logged in");
      }

      if (!projectData.imageUrl) {
        throw new Error("Image URL is required");
      }

      const backendProjectData = {
        name: projectData.name,
        description: "",
        imageUrl: projectData.imageUrl,
        imageFilename: projectData.imageFilename || "uploaded-image.jpg",
        imageWidth: projectData.width,
        imageHeight: projectData.height,
        ownerId: user._id,
      };

      const newProject = await projectService.createProject(backendProjectData);
      navigate(`/annotation/${newProject._id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      alert(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const handleAnnotationCreated = (annotation: AnnotationType) => {
    saveAnnotationToDatabase(annotation, currentImageId!, currentLabelId, user!);
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        modKey &&
        (e.key.toLowerCase() === "y" ||
          (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const toolbarTools: ToolbarTool[] = [
    {
      id: "move",
      isSelected: selectedTool === "move",
      icon: (
        <Move
          className={selectedTool === "move" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Move",
    },
    {
      id: "search",
      isSelected: selectedTool === "search",
      icon: (
        <Search
          className={selectedTool === "search" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Search",
    },
    {
      id: "marquee",
      isSelected: selectedTool === "marquee",
      icon: (
        <Maximize
          className={selectedTool === "marquee" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Marquee",
    },
    {
      id: "rectangle",
      isSelected: selectedTool === "rectangle",
      icon: (
        <Square
          className={selectedTool === "rectangle" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Rectangle",
    },
    {
      id: "line",
      isSelected: selectedTool === "line",
      icon: (
        <Minus
          className={selectedTool === "line" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Line",
    },
    {
      id: "brush",
      isSelected: selectedTool === "brush",
      icon: (
        <Brush
          className={selectedTool === "brush" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Brush",
    },
    {
      id: "skeleton",
      isSelected: selectedTool === "skeleton",
      icon: (
        <Wand2
          className={selectedTool === "skeleton" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Skeleton",
    },
    {
      id: "text",
      isSelected: selectedTool === "text",
      icon: (
        <Type
          className={selectedTool === "text" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Textbox",
    },
    {
      id: "eyedropper",
      isSelected: selectedTool === "eyedropper",
      icon: (
        <Pipette
          className={
            selectedTool === "eyedropper" ? "text-white" : "text-black"
          }
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Eyedropper",
    },
    {
      id: "pen",
      isSelected: selectedTool === "pen",
      icon: (
        <Pen
          className={selectedTool === "pen" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Pen",
    },
  ];

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">
            Loading Project...
          </div>
          <div className="text-gray-500">
            Please wait while we load your annotation project.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Project
          </div>
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
          <div className="text-xl font-semibold text-gray-900 mb-2">
            Project Not Found
          </div>
          <div className="text-gray-500">
            The requested project could not be found.
          </div>
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
        currentImage={activeFile}
        activeFiles={activeFiles}
        onSwitchFile={switchFile}
        onCloseFile={closeFile}
        onShowShareModal={() => setShowShareModal(true)}
        onShowExportModal={() => setShowExportModal(true)}
        onShowCreateModal={() => setShowCreateModal(true)}
        onShowOpenModal={() => setShowOpenModal(true)}
        onShowHelpModal={() => setShowHelpModal(true)}
        onCanvasZoom={handleCanvasZoom}
        onShowGrid={handleGrid}
        showGrid={showGrid}
        onAddImage={handleAddImage}
        tools={toolbarTools}
        onSelectTool={(toolId) => setSelectedTool(toolId)}
        others={others}
        cursorColors={CURSOR_COLORS}
        currentUser={
          user ? { username: user.username, email: user.email } : undefined
        }
        onSignOut={signout}
        onUndo={handleUndo} 
        onRedo={handleRedo} 
        canUndo={canUndo}
        canRedo={canRedo}
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
          setAnnotations={updateAnnotations}
          currentAnnotation={currentAnnotation}
          setCurrentAnnotation={setCurrentAnnotation}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          selectedAnnotationId={selectedAnnotationId}
          setSelectedAnnotationId={setSelectedAnnotationId}
          projectImage={activeFile}
          onAnnotationCreated={handleAnnotationCreated}
          showGrid={showGrid}
          currentLabelId={currentLabelId}
          currentLabelName={labels.find((label: any) => label._id === currentLabelId)?.name}
          labels={labels}
          onLabelAdvance={advanceToNextLabel}
        />
        <LabelPanel
          labels={labels}
          selectedLabelId={currentLabelId}
          onSelectLabel={handleLabelSelect}
          onManageLabels={() => setShowManageLabelsModal(true)}
        />

        {/* Other users' cursors */}
        {others.map(({ connectionId, presence }) => {
          if (!presence?.cursor) return null;

          const username = presence.userInfo?.name || "Anonymous User";
          const cursorColor =
            CURSOR_COLORS[connectionId % CURSOR_COLORS.length];

          return (
            <div
              key={`cursor-${connectionId}`}
              className="absolute pointer-events-none z-50"
            >
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
                {username}
              </div>
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
          id: project._id,
          name: project.name,
          annotations: allAnnotations
        }}
      />
      <CreateProject
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />
      <OpenProject
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        currentUserId={user?._id ?? ""}
      />
      <ManageLabels
        isOpen={showManageLabelsModal}
        onClose={() => setShowManageLabelsModal(false)}
        projectId={project._id}
        onLabelsChanged={handleLabelsChanged}
      />
      <Help
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Upload Loading Indicator */}
      {isUploadingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-900 font-medium">
                Uploading image...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnnotationCanvas() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const roomId = projectId ? `annotation-${projectId}` : "annotation-default";

  if (!user) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        const token = localStorage.getItem("auth_token");

        console.log("Token from localStorage:", token);
        console.log("Room:", room);

        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again."
          );
        }

        const response = await fetch("/api/liveblocks/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ room }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Auth failed:", errorText);
          throw new Error("Failed to authenticate with Liveblocks");
        }

        return await response.json();
      }}
    >
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          userInfo: {
            name: user.username,
            email: user.email,
          },
        }}
        initialStorage={{
          annotationIds: new LiveList<string>([]),
        }}
      >
        <Annotation />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
