import { useState } from "react";
import { useRef } from "react";  // add this
import { useParams } from "react-router-dom";
import { LiveblocksProvider, RoomProvider, useOthers, useMyPresence } from "@liveblocks/react";
import ShareProject from "../../components/modals/ShareProjectModal/ShareProject";
import Export from "../../components/modals/ExportModal/Export";
import LeftToolbar from "./components/LeftToolbar";
import CanvasArea from "./components/CanvasArea";
import LayersPanel from "./components/LayersPanel";
import TopNav from "./components/TopNav";
import Cursor from "../../components/ui/cursor";
import { ActiveFile, Layer, ToolbarTool } from "./types";
import { Move, Search, Maximize, Square, Minus, Brush, Type, Pipette, Wand2 } from "lucide-react";
import type { Annotation as AnnotationType } from "./types";
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
  // "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

function AnnotationCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { projectId } = useParams();
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  
  const [activeFiles, setActiveFiles] = useState<ActiveFile[]>([
    { id: "1", name: "Duck.jpg", isActive: true },
    { id: "2", name: "Eagle.jpg", isActive: false },
  ]);
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

  const layers: Layer[] = [
    { id: "1", name: "Bounding Boxes (1)", visible: true, locked: false },
    { id: "2", name: "Neck Lines (1)", color: "#5CBF7D", visible: true, locked: false },
    { id: "3", name: "Body Lines (1)", visible: true, locked: false },
    { id: "4", name: "Tail Lines (1)", visible: true, locked: false },
    { id: "5", name: "Beak Lines (1)", visible: true, locked: false },
    { id: "6", name: "Left Leg Lines (2)", visible: true, locked: false },
    { id: "7", name: "Right Leg Lines (2)", visible: true, locked: false },
  ];

  const closeFile = (fileId: string) => {
    setActiveFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const switchFile = (fileId: string) => {
    setActiveFiles(prev =>
      prev.map(file => ({ ...file, isActive: file.id === fileId }))
    );
  };

  return (
    <div 
      className="h-screen bg-white flex flex-col "
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
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
        others={others}
        cursorColors={CURSOR_COLORS}
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
        />
        <LayersPanel
          search={searchLayers}
          onSearchChange={setSearchLayers}
          layers={layers}
        />

        {/* Other users' cursors */}
        {others.map(({ connectionId, presence }) => {
          if (!presence?.cursor) return null;
          
          return (
            <div key={`cursor-${connectionId}`} className="absolute pointer-events-none z-50">
              <Cursor
                color={CURSOR_COLORS[connectionId % CURSOR_COLORS.length]}
                x={presence.cursor.x}
                y={presence.cursor.y}
              />
              {/* Show other users' selected tools */}
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

      {/* Modals */}
      <ShareProject
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectName="Duck Annotation"
      />
      <Export
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectData={{
          name: "Duck",
          annotations: {},
          image: "duck.jpg"
        }}
      />
    </div>
  );
}

export default function Annotation() {
  // Generate a unique room ID based on project ID or use a default
  const { projectId } = useParams();
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
        <AnnotationCanvas />
      </RoomProvider>
    </LiveblocksProvider>
  );
}