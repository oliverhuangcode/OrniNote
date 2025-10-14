import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Annotation } from "../types";
import AnnotationLayer from "./CanvasArea/AnnotationLayer";
import useTextTool from "./CanvasArea/tools/TextTool";
import useLineTool from "./CanvasArea/tools/LineTool";
import useShapeTool from "./CanvasArea/tools/ShapeTool";
import useBrushTool from "./CanvasArea/tools/BrushTool";
import usePenTool from "./CanvasArea/tools/PenTool";
import useSkeletonTool from "./CanvasArea/tools/SkeletonTool";

const MAX_CANVAS_WIDTH = 1600;
const MAX_CANVAS_HEIGHT = 1200;
const MIN_CANVAS_WIDTH = 800;
const MIN_CANVAS_HEIGHT = 600;

interface ActiveFile {
  id: string;
  name: string;
  isActive: boolean;
  imageUrl?: string;
  width?: number;
  height?: number;
}

interface CanvasAreaProps {
  zoomPercent: number;
  onZoom: (direction: "in" | "out" | "reset") => void;
  selectedTool: string;
  annotations: Annotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  currentAnnotation: Annotation | null;
  setCurrentAnnotation: React.Dispatch<React.SetStateAction<Annotation | null>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAnnotationId: string | null;
  setSelectedAnnotationId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedColor: string;
  projectImage?: ActiveFile;
  onAnnotationCreated?: (annotation: Annotation) => void;
  showGrid: boolean;
  currentLabelId?: string | null;
  currentLabelName?: string;
  labels?: Array<{ _id: string; name: string; colour: string }>;
  onLabelAdvance?: () => void;
}

export default function CanvasArea({
  zoomPercent,
  onZoom,
  selectedTool,
  annotations,
  setAnnotations,
  currentAnnotation,
  setCurrentAnnotation,
  isDrawing,
  setIsDrawing,
  selectedAnnotationId,
  setSelectedAnnotationId,
  selectedColor,
  projectImage,
  onAnnotationCreated,
  showGrid,
  currentLabelId,
  currentLabelName,
  labels,
  onLabelAdvance
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomLayerRef = useRef<HTMLDivElement | null>(null);
  const pixelScale = useMemo(() => zoomPercent / 100, [zoomPercent]);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });

  // 🧩 Deep clone helper
  // Safe deep clone for either a single annotation or an array
  const cloneAnnotations = <T extends Annotation | Annotation[]>(data: T): T =>
    JSON.parse(JSON.stringify(data));
  

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement | SVGImageElement>) => {
    const img = e.currentTarget as HTMLImageElement | SVGImageElement;

    const naturalWidth =
      (img as any).naturalWidth || (img as any).width?.baseVal?.value || 0;
    const naturalHeight =
      (img as any).naturalHeight || (img as any).height?.baseVal?.value || 0;

    let scaledWidth = naturalWidth;
    let scaledHeight = naturalHeight;

    // Scale down if image exceeds max bounds 
    if (scaledWidth > MAX_CANVAS_WIDTH || scaledHeight > MAX_CANVAS_HEIGHT) {
      const widthRatio = MAX_CANVAS_WIDTH / scaledWidth;
      const heightRatio = MAX_CANVAS_HEIGHT / scaledHeight;
      const scale = Math.min(widthRatio, heightRatio);
      scaledWidth = Math.round(scaledWidth * scale);
      scaledHeight = Math.round(scaledHeight * scale);
    }

    // Scale up if image is below min bounds 
    if (scaledWidth < MIN_CANVAS_WIDTH || scaledHeight < MIN_CANVAS_HEIGHT) {
      const widthRatio = MIN_CANVAS_WIDTH / scaledWidth;
      const heightRatio = MIN_CANVAS_HEIGHT / scaledHeight;
      const scale = Math.max(widthRatio, heightRatio);
      scaledWidth = Math.round(scaledWidth * scale);
      scaledHeight = Math.round(scaledHeight * scale);
    }

    setImageDimensions({
      width: scaledWidth,
      height: scaledHeight,
    });

    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    if (projectImage?.width && projectImage?.height) {
      setImageDimensions({
        width: projectImage.width,
        height: projectImage.height,
      });
    }
  }, [projectImage?.imageUrl, projectImage?.width, projectImage?.height]);

  // ✅ Add annotation with deep clone for undo/redo consistency
  const addAnnotation = useCallback(
    (a: Annotation) => {
      setAnnotations(prev => cloneAnnotations([...prev, a]));
      if (onAnnotationCreated) onAnnotationCreated(a);
    },
    [setAnnotations, onAnnotationCreated]
  );

  const textTool = useTextTool(pixelScale, addAnnotation, projectImage?.id || "", selectedColor);
  const lineTool = useLineTool(addAnnotation, projectImage?.id || "", selectedColor);
  const rectTool = useShapeTool("rectangle", addAnnotation, projectImage?.id || "", selectedColor);
  const brushTool = useBrushTool(addAnnotation, projectImage?.id || "", selectedColor);
  const penTool = usePenTool(addAnnotation, projectImage?.id || "", selectedColor);
  const skeletonTool = useSkeletonTool(addAnnotation, projectImage?.id || "", currentLabelId || "", currentLabelName || "", selectedColor, onLabelAdvance);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTool === "pen" && e.key === "Escape" && penTool.clear) {
        penTool.clear();
      }
      if (selectedTool === "skeleton" && e.key === "Escape" && skeletonTool.clear) {
        skeletonTool.clear();
      }
      if (selectedTool === "skeleton" && e.key === "Enter" && skeletonTool.finish) {
        skeletonTool.finish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTool, penTool, skeletonTool]);

  const [interaction, setInteraction] = useState<any>(null);
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [groupSelection, setGroupSelection] = useState<string[]>([]);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);

  const toLocalPoint = useCallback(
    (clientX: number, clientY: number) => {
      const layer = zoomLayerRef.current ?? containerRef.current;
      if (!layer) return { x: clientX, y: clientY };
      const bounds = layer.getBoundingClientRect();
      const x = (clientX - bounds.left) / pixelScale;
      const y = (clientY - bounds.top) / pixelScale;
      return { x, y };
    },
    [pixelScale]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = toLocalPoint(e.clientX, e.clientY);
      if (selectedTool === "pen") penTool.onClick(x, y);
      else if (selectedTool === "text") textTool.onClick(x, y);
      else if (selectedTool === "skeleton") {
        const clickedPointIndex = skeletonTool.getClickedPointIndex(x, y);
        skeletonTool.onClick(x, y, clickedPointIndex);
      }
      else if (selectedTool === "move") setSelectedAnnotationId(null);
    },
    [selectedTool, penTool, textTool, skeletonTool, toLocalPoint, setSelectedAnnotationId]
  );

  const handleMarqueeSelection = useCallback(
    (x: number, y: number) => {
      if (!marqueeStart || !marqueeRect) return;
      const selectedIds = annotations
        .filter(a => {
          if (a.type === "rectangle" && a.properties.position) {
            const { x: ax, y: ay } = a.properties.position;
            const w = a.properties.width || 0;
            const h = a.properties.height || 0;
            return (
              ax >= marqueeRect.x &&
              ay >= marqueeRect.y &&
              ax + w <= marqueeRect.x + marqueeRect.w &&
              ay + h <= marqueeRect.y + marqueeRect.h
            );
          }
          if (a.type === "polygon" && a.properties.points) {
            const xs = a.properties.points.map(p => p.x);
            const ys = a.properties.points.map(p => p.y);
            const minX = Math.min(...xs),
              maxX = Math.max(...xs);
            const minY = Math.min(...ys),
              maxY = Math.max(...ys);
            return (
              minX >= marqueeRect.x &&
              minY >= marqueeRect.y &&
              maxX <= marqueeRect.x + marqueeRect.w &&
              maxY <= marqueeRect.y + marqueeRect.h
            );
          }
          return false;
        })
        .map(a => a.id);
      setGroupSelection(selectedIds);
      setMarqueeRect(null);
      setMarqueeStart(null);
      setIsDrawing(false);
    },
    [annotations, marqueeStart, marqueeRect, setIsDrawing]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { x, y } = toLocalPoint(e.clientX, e.clientY);
      if (selectedTool === "line") lineTool.onMouseDown(x, y);
      else if (selectedTool === "marquee") {
        setMarqueeStart({ x, y });
        setMarqueeRect({ x, y, w: 0, h: 0 });
        setIsDrawing(true);
        return;
      } else if (selectedTool === "rectangle" || selectedTool === "polygon") rectTool.onMouseDown(x, y);
      else if (selectedTool === "brush") brushTool.onMouseDown(x, y);
      else if (selectedTool === "move") {
        const target = e.target as Element;
        const g = target.closest("g[data-ann-id]") as SVGGElement | null;
        if (g) {
          const annId = g.getAttribute("data-ann-id");
          if (annId) {
            setSelectedAnnotationId(annId);
            const ann = annotations.find(a => a.id === annId);
            if (ann) {
              setInteraction({
                kind: "move",
                annId,
                start: { x, y },
                original: cloneAnnotations(ann),
              });
              setIsDrawing(true);
            }
          }
        }
        return;
      }
      setIsDrawing(true);
    },
    [annotations, lineTool, rectTool, selectedTool, toLocalPoint, setIsDrawing, setSelectedAnnotationId, brushTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDrawing) return;
      const { x, y } = toLocalPoint(e.clientX, e.clientY);
      if (selectedTool === "line") lineTool.onMouseMove(x, y);
      else if (selectedTool === "rectangle" || selectedTool === "polygon") rectTool.onMouseMove(x, y);
      else if (selectedTool === "brush") brushTool.onMouseMove(x, y);
      else if (selectedTool === "marquee" && marqueeStart) {
        const w = x - marqueeStart.x;
        const h = y - marqueeStart.y;
        setMarqueeRect({
          x: w < 0 ? x : marqueeStart.x,
          y: h < 0 ? y : marqueeStart.y,
          w: Math.abs(w),
          h: Math.abs(h),
        });
      } else if (selectedTool === "move" && interaction) {
        const dx = x - interaction.start.x;
        const dy = y - interaction.start.y;
        setAnnotations(prev =>
          cloneAnnotations(
            prev.map(a => {
              if (a.id !== interaction.annId) return a;
              const cloned = cloneAnnotations(interaction.original);
              if (cloned.type === "rectangle" && cloned.properties.position) {
                cloned.properties.position.x += dx;
                cloned.properties.position.y += dy;
              } else if (cloned.type === "polygon" && cloned.properties.points) {
                cloned.properties.points = cloned.properties.points.map((p: any) => ({
                  x: p.x + dx,
                  y: p.y + dy,
                }));
              } else if (cloned.type === "line" && cloned.properties.points) {
                cloned.properties.points = cloned.properties.points.map((p: any) => ({
                  x: p.x + dx,
                  y: p.y + dy,
                }));
              } else if (cloned.type === "text" && cloned.properties.position) {
                cloned.properties.position.x += dx;
                cloned.properties.position.y += dy;
              }
              return cloned;
            })
          )
        );
      }
    },
    [brushTool, isDrawing, lineTool, rectTool, selectedTool, toLocalPoint, interaction, setAnnotations, marqueeStart]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDrawing) return;
      const { x, y } = toLocalPoint(e.clientX, e.clientY);
      
      if (selectedTool === "line") lineTool.onMouseUp(x, y);
      else if (selectedTool === "rectangle" || selectedTool === "polygon") rectTool.onMouseUp(x, y);
      else if (selectedTool === "brush") brushTool.onMouseUp();
      else if (selectedTool === "marquee") {
        handleMarqueeSelection(x, y);
        return;
      }
      else if (selectedTool === "move" && interaction) {
        // Save the moved annotation to database using the existing onAnnotationCreated
        const movedAnnotation = annotations.find(a => a.id === interaction.annId);
        if (movedAnnotation && onAnnotationCreated) {
          onAnnotationCreated(movedAnnotation);
        }
      }
      
      setIsDrawing(false);
      setInteraction(null);
    },
    [brushTool, isDrawing, lineTool, rectTool, selectedTool, toLocalPoint, setIsDrawing, handleMarqueeSelection, interaction, annotations, onAnnotationCreated]
  );

  const renderSelectionHandles = useCallback(() => {
    if (!selectedAnnotationId) return null;
    const a = annotations.find(x => x.id === selectedAnnotationId);
    if (!a) return null;
    if (a.type === "rectangle" && a.properties.position) {
      const { x, y } = a.properties.position;
      const w = a.properties.width || 0;
      const h = a.properties.height || 0;
      const handleSize = 6;
      const handles = [
        { key: "nw", x: x - handleSize / 2, y: y - handleSize / 2, cursor: "nwse-resize" },
        { key: "ne", x: x + w - handleSize / 2, y: y - handleSize / 2, cursor: "nesw-resize" },
        { key: "sw", x: x - handleSize / 2, y: y + h - handleSize / 2, cursor: "nesw-resize" },
        { key: "se", x: x + w - handleSize / 2, y: y + h - handleSize / 2, cursor: "nwse-resize" },
      ];
      return (
        <g>
          <rect x={x} y={y} width={w} height={h} fill="none" stroke="#3B82F6" strokeWidth={1} strokeDasharray="4 2" />
          {handles.map(hs => (
            <rect key={hs.key} x={hs.x} y={hs.y} width={handleSize} height={handleSize} fill="#3B82F6" cursor={hs.cursor} />
          ))}
        </g>
      );
    }
    return null;
  }, [selectedAnnotationId, annotations]);

  const canvasWidth = imageDimensions.width;
  const canvasHeight = imageDimensions.height;
  const scaledWidth = canvasWidth * pixelScale;
  const scaledHeight = canvasHeight * pixelScale;

  const zoomStyle = useMemo(
    () => ({
      transform: `scale(${pixelScale})`,
      transformOrigin: "top left" as const,
      width: canvasWidth,
      height: canvasHeight,
    }),
    [pixelScale, canvasWidth, canvasHeight]
  );

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
      <div className="absolute inset-0 overflow-auto">
        <div className="min-h-full flex items-center justify-center p-8" ref={containerRef}>
          <div
            className="relative bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5"
            style={{ width: scaledWidth, height: scaledHeight, minWidth: 400 * pixelScale, minHeight: 300 * pixelScale }}
          >
            <div className="relative w-full h-full bg-gray-50">
              <div ref={zoomLayerRef} className="absolute inset-0" style={zoomStyle}>
                <AnnotationLayer
                  annotations={annotations}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  marqueeRect={marqueeRect}
                  imageUrl={projectImage?.imageUrl}
                  imageName={projectImage?.name}
                  imageError={imageError}
                  onImageLoad={handleImageLoad}
                  onImageError={handleImageError}
                >
                  {selectedTool === "pen" && penTool.preview}
                  {selectedTool === "line" && lineTool.preview}
                  {(selectedTool === "rectangle" || selectedTool === "polygon") && rectTool.preview}
                  {selectedTool === "brush" && brushTool.preview}
                  {selectedTool === "skeleton" && skeletonTool.preview}
                  {renderSelectionHandles()}
                </AnnotationLayer>
              </div>
              {selectedTool === "text" && textTool.overlay}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none z-5"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "50px 50px",
                  }}
                />
              )}
            </div>
            
            {/* Modernized Zoom Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-1">
              <button 
                onClick={() => onZoom("out")} 
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700 font-semibold"
                title="Zoom out"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              
              <div className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                {zoomPercent}%
              </div>
              
              <button 
                onClick={() => onZoom("in")} 
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700 font-semibold"
                title="Zoom in"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <button 
                onClick={() => onZoom("reset")} 
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700"
                title="Reset zoom (100%)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8Z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}