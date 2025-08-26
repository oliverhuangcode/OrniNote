import { useState } from "react";
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

export default function Annotation() {
  const { projectId } = useParams();
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

  // --- Add this for color palette state ---
  const colorPalette = ["#3B3B3B", "#5CBF7D"];
  const [selectedColor, setSelectedColor] = useState<string>(colorPalette[0]);
  // ----------------------------------------

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
