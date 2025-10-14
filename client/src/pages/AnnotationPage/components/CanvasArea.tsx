import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Annotation } from "../types";
import AnnotationLayer from "./CanvasArea/AnnotationLayer";
import useTextTool from "./CanvasArea/tools/TextTool";
import useLineTool from "./CanvasArea/tools/LineTool";
import useShapeTool from "./CanvasArea/tools/ShapeTool";
import useBrushTool from "./CanvasArea/tools/BrushTool";
import usePenTool from "./CanvasArea/tools/PenTool";
import { annotationService } from "../../../services/annotationService";
import { Trash2 } from "lucide-react";


interface ActiveFile {
  id: string;
  name: string;
  isActive: boolean;
  imageUrl?: string;
  width?: number;
  height?: number;
}

type RectHandle = "nw" | "ne" | "sw" | "se";

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
  beginAtomicChange?: () => void;
  endAtomicChange?: () => void;
}

type Interaction =
  | null
  | {
      kind: "move";
      annId: string;
      start: { x: number; y: number };
      original: Annotation;
    }
  | {
      kind: "resize-rect";
      annId: string;
      handle: RectHandle;
      start: { x: number; y: number };
      original: Annotation;
    }
  | {
      kind: "line-end";
      annId: string;
      index: 0 | 1;
      start: { x: number; y: number };
      original: Annotation;
    };

const DRAG_THRESHOLD = 3;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

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
  beginAtomicChange = () => {},
  endAtomicChange = () => {},
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomLayerRef = useRef<HTMLDivElement | null>(null);
  const pixelScale = useMemo(() => zoomPercent / 100, [zoomPercent]);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });

  const [interaction, setInteraction] = useState<Interaction>(null);
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [groupSelection, setGroupSelection] = useState<string[]>([]);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);

  // ----- image load handlers
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement | SVGImageElement>) => {
    const img = e.currentTarget as any;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
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

  // ----- add annotation (creation tools call this)
  const addAnnotation = useCallback(
    (a: Annotation) => {
      setAnnotations(prev => [...prev, a]);
      onAnnotationCreated?.(a);
    },
    [setAnnotations, onAnnotationCreated]
  );

  // ----- tools
  const textTool = useTextTool(pixelScale, addAnnotation, projectImage?.id || "", selectedColor);
  const lineTool = useLineTool(addAnnotation, projectImage?.id || "", selectedColor);
  const rectTool = useShapeTool("rectangle", addAnnotation, projectImage?.id || "", selectedColor);
  const brushTool = useBrushTool(addAnnotation, projectImage?.id || "", selectedColor);
  const penTool = usePenTool(addAnnotation, projectImage?.id || "", selectedColor);

  // ESC clears active pen path (if tool supports)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedTool === "pen" && e.key === "Escape" && (penTool as any)?.clear) {
        (penTool as any).clear();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedTool, penTool]);

  // ----- screen to canvas coords
  const toLocalPoint = useCallback(
    (clientX: number, clientY: number) => {
      const layer = zoomLayerRef.current ?? containerRef.current;
      if (!layer) return { x: clientX, y: clientY };
      const bounds = layer.getBoundingClientRect();
      return {
        x: (clientX - bounds.left) / pixelScale,
        y: (clientY - bounds.top) / pixelScale,
      };
    },
    [pixelScale]
  );

  // ----- background click vs select
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (selectedTool !== "move") return;
      const target = e.target as Element;
      const g = target.closest("g[data-ann-id]") as SVGGElement | null;
      if (g) {
        const annId = g.getAttribute("data-ann-id");
        if (annId) setSelectedAnnotationId(annId);
      } else {
        setSelectedAnnotationId(null);
      }
    },
    [selectedTool, setSelectedAnnotationId]
  );

  // ----- bounds for delete badge placement
  const getAnnotationBounds = (a: Annotation) => {
    if (a.type === "rectangle" && a.properties.position) {
      const { x, y } = a.properties.position;
      const w = a.properties.width || 0;
      const h = a.properties.height || 0;
      return { minX: x, minY: y, maxX: x + w, maxY: y + h };
    }
    if ((a.type === "polygon" || a.type === "line" || a.type === "path" || a.type === "brush") && a.properties.points?.length) {
      const xs = a.properties.points.map(p => p.x);
      const ys = a.properties.points.map(p => p.y);
      return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
    }
    if (a.type === "text" && a.properties.position) {
      const { x, y } = a.properties.position;
      return { minX: x, minY: y - 16, maxX: x + 80, maxY: y + 4 };
    }
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  };

  // ----- delete helper (optimistic, with rollback)
  const deleteAnnotationById = useCallback(
    async (id: string) => {
      const snapshot = annotations.slice();
      setAnnotations(prev => prev.filter(a => a.id !== id));
      setSelectedAnnotationId(null);
      try {
        await annotationService.deleteAnnotation(id);
      } catch (err) {
        console.error("Delete failed; rolling back:", err);
        setAnnotations(snapshot);
      }
    },
    [annotations, setAnnotations, setSelectedAnnotationId]
  );

  // ----- marquee selection
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

  // ----- mousedown
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { x, y } = toLocalPoint(e.clientX, e.clientY);

      if (selectedTool === "line") {
        lineTool.onMouseDown(x, y);
        setIsDrawing(true);
        return;
      }
      if (selectedTool === "marquee") {
        setMarqueeStart({ x, y });
        setMarqueeRect({ x, y, w: 0, h: 0 });
        setIsDrawing(true);
        return;
      }
      if (selectedTool === "rectangle" || selectedTool === "polygon") {
        rectTool.onMouseDown(x, y);
        setIsDrawing(true);
        return;
      }
      if (selectedTool === "brush") {
        brushTool.onMouseDown(x, y);
        setIsDrawing(true);
        return;
      }
      if (selectedTool === "move") {
        const target = e.target as Element;
        const g = target.closest("g[data-ann-id]") as SVGGElement | null;
        if (g) {
          const annId = g.getAttribute("data-ann-id");
          if (!annId) return;
          setSelectedAnnotationId(annId);
          const ann = annotations.find(a => a.id === annId);
          if (!ann) return;
          setInteraction({
            kind: "move",
            annId,
            start: { x, y },
            original: clone(ann),
          });
          setIsDrawing(true);
          return;
        }
        // background mousedown in move mode → let click clear selection later
        return;
      }
    },
    [annotations, lineTool, rectTool, selectedTool, toLocalPoint, setIsDrawing, setSelectedAnnotationId, brushTool]
  );

  // ----- mousemove
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDrawing) return;
      const { x, y } = toLocalPoint(e.clientX, e.clientY);

      if (selectedTool === "line") {
        lineTool.onMouseMove(x, y);
        return;
      }
      if (selectedTool === "rectangle" || selectedTool === "polygon") {
        rectTool.onMouseMove(x, y);
        return;
      }
      if (selectedTool === "brush") {
        brushTool.onMouseMove(x, y);
        return;
      }
      if (selectedTool === "marquee" && marqueeStart) {
        const w = x - marqueeStart.x;
        const h = y - marqueeStart.y;
        setMarqueeRect({
          x: w < 0 ? x : marqueeStart.x,
          y: h < 0 ? y : marqueeStart.y,
          w: Math.abs(w),
          h: Math.abs(h),
        });
        return;
      }
      if (selectedTool === "move" && interaction) {
        const dx = x - interaction.start.x;
        const dy = y - interaction.start.y;

        setAnnotations(prev =>
          prev.map(a => {
            if (a.id !== interaction.annId) return a;
            const cloned = clone(interaction.original);
            if (cloned.type === "rectangle" && cloned.properties.position) {
              cloned.properties.position.x += dx;
              cloned.properties.position.y += dy;
            } else if (cloned.type === "polygon" && cloned.properties.points) {
              cloned.properties.points = cloned.properties.points.map((p: any) => ({ x: p.x + dx, y: p.y + dy }));
            } else if (cloned.type === "line" && cloned.properties.points) {
              cloned.properties.points = cloned.properties.points.map((p: any) => ({ x: p.x + dx, y: p.y + dy }));
            } else if (cloned.type === "text" && cloned.properties.position) {
              cloned.properties.position.x += dx;
              cloned.properties.position.y += dy;
            }
            return cloned;
          })
        );
      }
    },
    [brushTool, isDrawing, lineTool, rectTool, selectedTool, toLocalPoint, interaction, setAnnotations, marqueeStart]
  );

  // ----- mouseup
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDrawing) return;
      const { x, y } = toLocalPoint(e.clientX, e.clientY);

      if (selectedTool === "line") {
        lineTool.onMouseUp(x, y);
      } else if (selectedTool === "rectangle" || selectedTool === "polygon") {
        rectTool.onMouseUp(x, y);
      } else if (selectedTool === "brush") {
        brushTool.onMouseUp();
      } else if (selectedTool === "marquee") {
        handleMarqueeSelection(x, y);
      }

      setIsDrawing(false);
      setInteraction(null);
    },
    [brushTool, isDrawing, lineTool, rectTool, selectedTool, toLocalPoint, setIsDrawing, handleMarqueeSelection]
  );

  // ----- ESC clears selection
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedAnnotationId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelectedAnnotationId]);

  // ----- Delete/Backspace (and Cmd/Ctrl+X) → delete via API
  useEffect(() => {
    const onGlobalDelete = (e: KeyboardEvent) => {
      if (!selectedAnnotationId) return;

      // don't delete while typing in inputs/textareas/contenteditable
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable)
      ) {
        return;
      }

      const isDeleteKey =
        e.key === "Backspace" ||
        e.key === "Delete" ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "x");

      if (!isDeleteKey) return;

      e.preventDefault();
      e.stopPropagation();
      deleteAnnotationById(selectedAnnotationId);
    };

    // capture=true so we get the event early
    window.addEventListener("keydown", onGlobalDelete, true);
    return () => window.removeEventListener("keydown", onGlobalDelete, true);
  }, [selectedAnnotationId, deleteAnnotationById]);

  // ----- selection handles + centered ✕ badge
  const renderSelectionHandles = useCallback(() => {
    if (!selectedAnnotationId) return null;
    const a = annotations.find(x => x.id === selectedAnnotationId);
    if (!a) return null;

   // --- Delete badge (uses lucide-react Trash2) ---
const BTN = 22;        // badge size
const RADIUS = 6;      // rounded-rect radius
 const OFFSET = 8; 
const ICON = 16;       // icon size inside the badge

const bounds = getAnnotationBounds(a); 
 const btnX = bounds.maxX - BTN / 2;
  const btnY = bounds.minY - OFFSET - BTN;

const DeleteBadge = (
  <g
    transform={`translate(${btnX}, ${btnY})`}
    onMouseDown={(ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      deleteAnnotationById(a.id);
    }}
    style={{ cursor: "pointer" }}
  >
    {/* badge background */}
    <rect
      x={0}
      y={0}
      width={BTN}
      height={BTN}
      rx={RADIUS}
      ry={RADIUS}
      fill="#FEE2E2"     // light red bg
      stroke="#FCA5A5"   // soft red border
      strokeWidth={1}
    />
    {/* icon centered */}
    <g transform={`translate(${(BTN - ICON) / 2}, ${(BTN - ICON) / 2})`}>
      <Trash2 width={ICON} height={ICON} stroke="#B91C1C" strokeWidth={2} />
    </g>
  </g>
);


    if (a.type === "rectangle" && a.properties.position) {
      const x = a.properties.position.x;
      const y = a.properties.position.y;
      const w = a.properties.width || 0;
      const h = a.properties.height || 0;
      const handleSize = 6;

      const handles = [
        { key: "nw", x: x - handleSize / 2, y: y - handleSize / 2, cursor: "nwse-resize", handleKey: "nw" as const },
        { key: "ne", x: x + w - handleSize / 2, y: y - handleSize / 2, cursor: "nesw-resize", handleKey: "ne" as const },
        { key: "sw", x: x - handleSize / 2, y: y + h - handleSize / 2, cursor: "nesw-resize", handleKey: "sw" as const },
        { key: "se", x: x + w - handleSize / 2, y: y + h - handleSize / 2, cursor: "nwse-resize", handleKey: "se" as const },
      ];

      return (
        <g>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            stroke="#3B82F6"
            strokeWidth={1}
            strokeDasharray="4 2"
            pointerEvents="none"
          />
          {handles.map(({ key, x: hx, y: hy, cursor, handleKey }) => (
            <rect
              key={key}
              x={hx}
              y={hy}
              width={handleSize}
              height={handleSize}
              fill="#3B82F6"
              cursor={cursor}
              onMouseDown={ev => {
                ev.stopPropagation();
                const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY);
                setInteraction({
                  kind: "resize-rect",
                  annId: a.id,
                  handle: handleKey,
                  start: { x: lx, y: ly },
                  original: clone(a),
                });
                setIsDrawing(true);
              }}
            />
          ))}
          {DeleteBadge}
        </g>
      );
    }

    return <g>{DeleteBadge}</g>;
  }, [selectedAnnotationId, annotations, deleteAnnotationById, toLocalPoint, setIsDrawing]);

  // ----- canvas size / zoom
  const canvasWidth = Math.max(imageDimensions.width, 800);
  const canvasHeight = Math.max(imageDimensions.height, 600);
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
    <div className="flex-1 bg-gray-200 overflow-hidden relative">
      <div className="absolute inset-0 overflow-auto">
        <div className="min-h-full flex items-center justify-center p-8" ref={containerRef}>
          <div
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{ width: scaledWidth, height: scaledHeight, minWidth: 400 * pixelScale, minHeight: 300 * pixelScale }}
          >
            <div className="relative w-full h-full bg-gray-100">
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
                  {selectedTool === "pen" && (penTool as any).preview}
                  {selectedTool === "line" && (lineTool as any).preview}
                  {(selectedTool === "rectangle" || selectedTool === "polygon") && (rectTool as any).preview}
                  {selectedTool === "brush" && (brushTool as any).preview}
                  {renderSelectionHandles()}
                </AnnotationLayer>
              </div>

              {selectedTool === "text" && (textTool as any).overlay}

              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none z-5"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: "50px 50px",
                  }}
                />
              )}
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => onZoom("in")}
                className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => onZoom("out")}
                className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100"
                title="Zoom Out"
              >
                −
              </button>
              <button
                onClick={() => onZoom("reset")}
                className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100"
                title="Reset Zoom"
              >
                ⟲
              </button>
              <div className="ml-2 px-2 py-1 bg-white bg-opacity-80 rounded border border-gray-300 text-xs font-medium">
                {zoomPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
