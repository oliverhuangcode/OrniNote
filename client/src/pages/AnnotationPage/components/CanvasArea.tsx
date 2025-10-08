import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Annotation } from "../types";
import AnnotationLayer from "./CanvasArea/AnnotationLayer";
import useTextTool from "./CanvasArea/tools/TextTool";
import useLineTool from "./CanvasArea/tools/LineTool";
import useShapeTool from "./CanvasArea/tools/ShapeTool";
import useBrushTool from "./CanvasArea/tools/BrushTool";
import usePenTool from "./CanvasArea/tools/PenTool";

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
  projectImage?: ActiveFile; // New prop for project image
  onAnnotationCreated?: (annotation: Annotation) => void; 
  showGrid: boolean;
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
  showGrid
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomLayerRef = useRef<HTMLDivElement | null>(null);
  const pixelScale = useMemo(() => (zoomPercent / 100), [zoomPercent]);

  // Image loading state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });

  // Handle image load
  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement | SVGImageElement>
  ) => {
    const img = e.currentTarget;
    // SVGImageElement also has naturalWidth/naturalHeight
    setImageDimensions({
      width: (img as any).naturalWidth,
      height: (img as any).naturalHeight
    });
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Reset image state when projectImage changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    if (projectImage?.width && projectImage?.height) {
      setImageDimensions({
        width: projectImage.width,
        height: projectImage.height
      });
    }
  }, [projectImage?.imageUrl, projectImage?.width, projectImage?.height]);

  const addAnnotation = useCallback((a: Annotation) => {
    setAnnotations(prev => [...prev, a]);
    // Save to database
    if (onAnnotationCreated) {
      onAnnotationCreated(a);
    }
  }, [setAnnotations, onAnnotationCreated]);

  const textTool = useTextTool(pixelScale, addAnnotation, selectedColor);
  const lineTool = useLineTool(addAnnotation, selectedColor);
  const rectTool = useShapeTool("rectangle", addAnnotation, selectedColor);
  const brushTool = useBrushTool(addAnnotation, selectedColor);
  const penTool = usePenTool(addAnnotation, selectedColor);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTool === "pen" && e.key === "Escape") {
        if (penTool.clear) penTool.clear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTool, penTool]);

  const [interaction, setInteraction] = useState<
    | null
    | { kind: "move"; annId: string; start: { x: number; y: number }; original: Annotation }
    | { kind: "resize-rect"; annId: string; handle: "nw" | "ne" | "sw" | "se"; start: { x: number; y: number }; original: Annotation }
    | { kind: "line-end"; annId: string; index: 0 | 1; start: { x: number; y: number }; original: Annotation }
  >(null);

  const [marqueeRect, setMarqueeRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [groupSelection, setGroupSelection] = useState<string[]>([]);
  const [marqueeStart, setMarqueeStart] = useState<{x: number, y: number} | null>(null);

  const toLocalPoint = useCallback((clientX: number, clientY: number) => {
    const layer = zoomLayerRef.current ?? containerRef.current;
    if (!layer) return { x: clientX, y: clientY };
    const bounds = layer.getBoundingClientRect();
    const x = (clientX - bounds.left) / pixelScale;
    const y = (clientY - bounds.top) / pixelScale;
    return { x, y };
  }, [pixelScale]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = toLocalPoint(e.clientX, e.clientY);
    if (selectedTool === "pen") {
      penTool.onClick(x, y);
    } else if (selectedTool === "text") {
      textTool.onClick(x, y);
    } else if (selectedTool === "move") {
      // clicking empty canvas clears selection
      setSelectedAnnotationId(null);
    }
  }, [selectedTool, penTool, textTool, toLocalPoint, setSelectedAnnotationId]);

  const handleMarqueeSelection = useCallback((x: number, y: number) => {
    if (!marqueeStart || !marqueeRect) return;
    
    // Find all annotations whose bounding box is inside marqueeRect
    const selectedIds = annotations
      .filter(a => {
        // Compute bounding box for each annotation type
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
          const minX = Math.min(...xs), maxX = Math.max(...xs);
          const minY = Math.min(...ys), maxY = Math.max(...ys);
          return (
            minX >= marqueeRect.x &&
            minY >= marqueeRect.y &&
            maxX <= marqueeRect.x + marqueeRect.w &&
            maxY <= marqueeRect.y + marqueeRect.h
          );
        }
        // Add similar logic for lines, text, etc.
        return false;
      })
      .map(a => a.id);
    
    setGroupSelection(selectedIds);
    setMarqueeRect(null);
    setMarqueeStart(null);
    setIsDrawing(false);
  }, [annotations, marqueeStart, marqueeRect, setIsDrawing]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = toLocalPoint(e.clientX, e.clientY);
    
    if (selectedTool === "line") {
      lineTool.onMouseDown(x, y);
    } else if (selectedTool === "marquee") {
      setMarqueeStart({ x, y });
      setMarqueeRect({ x, y, w: 0, h: 0 });
      setIsDrawing(true);
      return;
    } else if (selectedTool === "rectangle" || selectedTool === "polygon") {
      rectTool.onMouseDown(x, y);
    } else if (selectedTool === "brush") {
      brushTool.onMouseDown(x, y);
    } else if (selectedTool === "move") {
      const target = e.target as Element;
      const g = target.closest('g[data-ann-id]') as SVGGElement | null;
      if (g) {
        const annId = g.getAttribute('data-ann-id');
        if (annId) {
          setSelectedAnnotationId(annId);
          const ann = annotations.find(a => a.id === annId);
          if (ann) {
            setInteraction({ kind: "move", annId, start: { x, y }, original: JSON.parse(JSON.stringify(ann)) });
            setIsDrawing(true);
          }
        }
      }
      return;
    }
    
    setIsDrawing(true);
  }, [annotations, lineTool, rectTool, selectedTool, toLocalPoint, setIsDrawing, setSelectedAnnotationId, brushTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const { x, y } = toLocalPoint(e.clientX, e.clientY);
    
    if (selectedTool === "line") {
      lineTool.onMouseMove(x, y);
    } else if (selectedTool === "rectangle" || selectedTool === "polygon") {
      rectTool.onMouseMove(x, y);
    } else if (selectedTool === "brush") {
      brushTool.onMouseMove(x, y);
    } else if (selectedTool === "marquee" && marqueeStart) {
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
      
      setAnnotations(prev => prev.map(a => {
        if (a.id !== interaction.annId) return a;
        const cloned: Annotation = JSON.parse(JSON.stringify(interaction.original));
        
        if (interaction.kind === "move") {
          if (cloned.type === "polygon" && cloned.properties.points) {
            cloned.properties.points = cloned.properties.points.map((p: { x: number, y: number }) => ({
              x: p.x + dx,
              y: p.y + dy
            }));
          } else if (cloned.type === "text" && cloned.properties.position) {
            cloned.properties.position.x += dx;
            cloned.properties.position.y += dy;
          } else if (cloned.type === "rectangle" && cloned.properties.position) {
            cloned.properties.position.x += dx;
            cloned.properties.position.y += dy;
          } else if (cloned.type === "line" && cloned.properties.points) {
            cloned.properties.points = cloned.properties.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
          }
        } else if (interaction.kind === "resize-rect") {
          if (cloned.type === "rectangle" && cloned.properties.position) {
            const { x: ox, y: oy } = interaction.original.properties.position!;
            const ow = interaction.original.properties.width || 0;
            const oh = interaction.original.properties.height || 0;
            let nx = ox, ny = oy, nw = ow, nh = oh;
            
            if (interaction.handle === "nw") { nx = ox + dx; ny = oy + dy; nw = ow - dx; nh = oh - dy; }
            else if (interaction.handle === "ne") { ny = oy + dy; nw = ow + dx; nh = oh - dy; }
            else if (interaction.handle === "sw") { nx = ox + dx; nw = ow - dx; nh = oh + dy; }
            else if (interaction.handle === "se") { nw = ow + dx; nh = oh + dy; }
            
            if (nw < 0) { nx = nx + nw; nw = Math.abs(nw); }
            if (nh < 0) { ny = ny + nh; nh = Math.abs(nh); }
            
            cloned.properties.position.x = nx;
            cloned.properties.position.y = ny;
            cloned.properties.width = nw;
            cloned.properties.height = nh;
          }
        } else if (interaction.kind === "line-end") {
          if (cloned.type === "line" && cloned.properties.points) {
            const idx = interaction.index;
            const o = interaction.original.properties.points![idx];
            cloned.properties.points[idx] = { x: o.x + dx, y: o.y + dy };
          }
        }
        return cloned;
      }));
    } else if (selectedTool === "marquee" && groupSelection.length > 0) {
      // Move group selection
      const dx = x - (marqueeStart?.x || 0);
      const dy = y - (marqueeStart?.y || 0);
      
      setAnnotations(prev =>
        prev.map(a => {
          if (!groupSelection.includes(a.id)) return a;
          
          if (a.type === "rectangle" && a.properties.position) {
            return {
              ...a,
              properties: {
                ...a.properties,
                position: {
                  x: a.properties.position.x + dx,
                  y: a.properties.position.y + dy,
                },
              },
            };
          }
          if (a.type === "polygon" && a.properties.points) {
            return {
              ...a,
              properties: {
                ...a.properties,
                points: a.properties.points.map(p => ({
                  x: p.x + dx,
                  y: p.y + dy,
                })),
              },
            };
          }
          return a;
        })
      );
    }
  }, [brushTool, isDrawing, lineTool, rectTool, selectedTool, toLocalPoint, interaction, setAnnotations, groupSelection, marqueeStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
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
      return;
    }
    
    setIsDrawing(false);
    setInteraction(null);
  }, [brushTool, isDrawing, lineTool, rectTool, selectedTool, toLocalPoint, setIsDrawing, handleMarqueeSelection]);

  const renderSelectionHandles = useCallback(() => {
    if (!selectedAnnotationId) return null;
    
    const a = annotations.find(x => x.id === selectedAnnotationId);
    if (!a) return null;
    
    if (a.type === "rectangle" && a.properties.position) {
      const x = a.properties.position.x;
      const y = a.properties.position.y;
      const w = a.properties.width || 0;
      const h = a.properties.height || 0;
      const handleSize = 6;
      const hs = handleSize;
      
      const handles = [
        { key: "nw", x: x - hs/2, y: y - hs/2, cursor: "nwse-resize", handle: "nw" as const },
        { key: "ne", x: x + w - hs/2, y: y - hs/2, cursor: "nesw-resize", handle: "ne" as const },
        { key: "sw", x: x - hs/2, y: y + h - hs/2, cursor: "nesw-resize", handle: "sw" as const },
        { key: "se", x: x + w - hs/2, y: y + h - hs/2, cursor: "nwse-resize", handle: "se" as const },
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
          {handles.map(({ key, x: hx, y: hy, cursor, handle }) => (
            <rect
              key={key}
              x={hx}
              y={hy}
              width={hs}
              height={hs}
              fill="#3B82F6"
              cursor={cursor}
              onMouseDown={(ev) => {
                ev.stopPropagation();
                const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY);
                setInteraction({
                  kind: "resize-rect",
                  annId: a.id,
                  handle,
                  start: { x: lx, y: ly },
                  original: JSON.parse(JSON.stringify(a))
                });
                setIsDrawing(true);
              }}
            />
          ))}
        </g>
      );
    } else if (a.type === "line" && a.properties.points && a.properties.points.length >= 2) {
      const [p1, p2] = a.properties.points;
      const r = 5;
      
      return (
        <g>
          {[p1, p2].map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={r}
              fill="#3B82F6"
              cursor="grab"
              onMouseDown={(ev) => {
                ev.stopPropagation();
                const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY);
                setInteraction({
                  kind: "line-end",
                  annId: a.id,
                  index: index as 0 | 1,
                  start: { x: lx, y: ly },
                  original: JSON.parse(JSON.stringify(a))
                });
                setIsDrawing(true);
              }}
            />
          ))}
        </g>
      );
    }
    
    return null;
  }, [selectedAnnotationId, annotations, toLocalPoint, setInteraction, setIsDrawing]);

  // Calculate canvas dimensions based on image or default size
  const canvasWidth = Math.max(imageDimensions.width, 800);
  const canvasHeight = Math.max(imageDimensions.height, 600);
  const scaledWidth = canvasWidth * pixelScale;
  const scaledHeight = canvasHeight * pixelScale;

  const zoomStyle = useMemo(() => ({ 
    transform: `scale(${pixelScale})`, 
    transformOrigin: "top left" as const,
    width: canvasWidth,
    height: canvasHeight,
  }), [pixelScale, canvasWidth, canvasHeight]);

  return (
    <div className="flex-1 bg-gray-200 overflow-hidden relative">
      <div className="absolute inset-0 overflow-auto">
        <div 
          className="min-h-full flex items-center justify-center p-8"
          ref={containerRef}
        >
          <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden" style={{
            width: scaledWidth,
            height: scaledHeight,
            minWidth: 400 * pixelScale,
            minHeight: 300 * pixelScale
          }}>
            <div className="relative w-full h-full bg-gray-100">
              <div ref={zoomLayerRef} className="absolute inset-0" style={zoomStyle}>
                {/* Annotation + Image layer */}
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
                  {/* Tool previews */}
                  {selectedTool === "pen" && penTool.preview}
                  {selectedTool === "line" && lineTool.preview}
                  {(selectedTool === "rectangle" || selectedTool === "polygon") && rectTool.preview}
                  {selectedTool === "brush" && brushTool.preview}
                  
                  {/* Selection handles */}
                  {renderSelectionHandles()}
                </AnnotationLayer>
              </div>
              {/* Text tool overlay (rendered outside SVG) */}
              {selectedTool === "text" ? textTool.overlay : null}

              {/* Grid overlay */}
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

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => onZoom("in")}
                className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100 transition-colors"
                title="Zoom In"
              >
                <span className="text-xs font-bold">+</span>
              </button>
              <button
                onClick={() => onZoom("out")}
                className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100 transition-colors"
                title="Zoom Out"
              >
                <span className="text-xs font-bold">-</span>
              </button>
              <button
                onClick={() => onZoom("reset")}
                className="w-8 h-8 bg-white bg-opacity-80 rounded border border-gray-300 flex items-center justify-center hover:bg-opacity-100 transition-colors"
                title="Reset Zoom"
              >
                <span className="text-xs font-bold">⟲</span>
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