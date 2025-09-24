// client/src/pages/AnnotationPage/components/CanvasArea.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Annotation } from "../types";

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
  selectedColor: string;
  annotations: Annotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  currentAnnotation: Annotation | null;
  setCurrentAnnotation: React.Dispatch<React.SetStateAction<Annotation | null>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAnnotationId: string | null;
  setSelectedAnnotationId: React.Dispatch<React.SetStateAction<string | null>>;
  projectImage?: ActiveFile; // New prop for project image
}

// Interaction types for handling mouse events
type Interaction = 
  | { kind: "move"; annId: string; start: { x: number; y: number }; original: Annotation }
  | { kind: "line-end"; annId: string; index: number; start: { x: number; y: number }; original: Annotation };

export default function CanvasArea({
  zoomPercent,
  onZoom,
  selectedTool,
  selectedColor,
  annotations,
  setAnnotations,
  currentAnnotation,
  setCurrentAnnotation,
  isDrawing,
  setIsDrawing,
  selectedAnnotationId,
  setSelectedAnnotationId,
  projectImage
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });

  const pixelScale = zoomPercent / 100;

  // Handle image load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
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

  // Simple text tool implementation
  const textTool = {
    overlay: currentAnnotation?.type === "text" && (
      <div
        style={{
          position: "absolute",
          left: (currentAnnotation.properties.x || 0) * pixelScale,
          top: (currentAnnotation.properties.y || 0) * pixelScale,
          zIndex: 1000,
        }}
      >
        <input
          type="text"
          autoFocus
          onBlur={() => setCurrentAnnotation(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setCurrentAnnotation(null);
            }
          }}
          className="border border-gray-300 bg-white px-2 py-1 text-sm"
          placeholder="Type text..."
        />
      </div>
    ),
    onClick: (x: number, y: number) => {
      const id = Math.random().toString();
      const newAnnotation: Annotation = {
        id,
        type: "text",
        properties: { x, y, text: "" },
      };
      setCurrentAnnotation(newAnnotation);
      setAnnotations((prev) => [...prev, newAnnotation]);
    },
  };

  // Line tool implementation
  const lineTool = {
    onMouseDown: (x: number, y: number) => {
      const id = Math.random().toString();
      const newAnnotation: Annotation = {
        id,
        type: "line",
        properties: { points: [{ x, y }, { x, y }] },
      };
      setCurrentAnnotation(newAnnotation);
    },
    onMouseMove: (x: number, y: number) => {
      if (currentAnnotation?.type === "line") {
        const updated = { ...currentAnnotation };
        if (updated.properties.points && updated.properties.points.length >= 2) {
          updated.properties.points[1] = { x, y };
          setCurrentAnnotation(updated);
        }
      }
    },
    onMouseUp: () => {
      if (currentAnnotation) {
        setAnnotations((prev) => [...prev, currentAnnotation]);
        setCurrentAnnotation(null);
      }
    },
  };

  // Rectangle tool implementation
  const rectTool = {
    onMouseDown: (x: number, y: number) => {
      const id = Math.random().toString();
      const newAnnotation: Annotation = {
        id,
        type: "rectangle",
        properties: { x, y, width: 0, height: 0 },
      };
      setCurrentAnnotation(newAnnotation);
    },
    onMouseMove: (x: number, y: number) => {
      if (currentAnnotation?.type === "rectangle") {
        const updated = { ...currentAnnotation };
        const startX = updated.properties.x || 0;
        const startY = updated.properties.y || 0;
        updated.properties.width = x - startX;
        updated.properties.height = y - startY;
        setCurrentAnnotation(updated);
      }
    },
    onMouseUp: () => {
      if (currentAnnotation) {
        setAnnotations((prev) => [...prev, currentAnnotation]);
        setCurrentAnnotation(null);
      }
    },
  };

  // Brush tool implementation
  const brushTool = {
    onMouseDown: (x: number, y: number) => {
      const id = Math.random().toString();
      const newAnnotation: Annotation = {
        id,
        type: "brush",
        properties: { points: [{ x, y }] },
      };
      setCurrentAnnotation(newAnnotation);
    },
    onMouseMove: (x: number, y: number) => {
      if (currentAnnotation?.type === "brush") {
        const updated = { ...currentAnnotation };
        if (!updated.properties.points) updated.properties.points = [];
        updated.properties.points.push({ x, y });
        setCurrentAnnotation(updated);
      }
    },
    onMouseUp: () => {
      if (currentAnnotation) {
        setAnnotations((prev) => [...prev, currentAnnotation]);
        setCurrentAnnotation(null);
      }
    },
  };

  // Convert screen coordinates to local canvas coordinates
  const toLocalPoint = useCallback((clientX: number, clientY: number) => {
    const layer = containerRef.current?.querySelector(".annotation-canvas") as HTMLElement | null
      || containerRef.current;
    if (!layer) return { x: clientX, y: clientY };
    const bounds = layer.getBoundingClientRect();
    const x = (clientX - bounds.left) / pixelScale;
    const y = (clientY - bounds.top) / pixelScale;
    return { x, y };
  }, [pixelScale]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = toLocalPoint(e.clientX, e.clientY);
    if (selectedTool === "text") {
      textTool.onClick(x, y);
    } else if (selectedTool === "move") {
      // clicking empty canvas clears selection
      setSelectedAnnotationId(null);
    }
  }, [selectedTool, textTool, toLocalPoint, setSelectedAnnotationId]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = toLocalPoint(e.clientX, e.clientY);
    if (selectedTool === "line") lineTool.onMouseDown(x, y);
    if (selectedTool === "rectangle" || selectedTool === "polygon") rectTool.onMouseDown(x, y);
    if (selectedTool === "brush") brushTool.onMouseDown(x, y);
    if (selectedTool === "move") {
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
    } else {
      setIsDrawing(true);
    }
  }, [annotations, lineTool, rectTool, selectedTool, toLocalPoint, setIsDrawing, setSelectedAnnotationId, brushTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const { x, y } = toLocalPoint(e.clientX, e.clientY);
    if (selectedTool === "line") lineTool.onMouseMove(x, y);
    else if (selectedTool === "rectangle" || selectedTool === "polygon") rectTool.onMouseMove(x, y);
    else if (selectedTool === "brush") brushTool.onMouseMove(x, y);
    else if (selectedTool === "move" && interaction) {
      if (interaction.kind === "move") {
        const dx = x - interaction.start.x;
        const dy = y - interaction.start.y;
        setAnnotations(prev => prev.map(a => {
          if (a.id === interaction.annId) {
            const updated = { ...interaction.original };
            if (updated.type === "rectangle" && typeof updated.properties.x === "number" && typeof updated.properties.y === "number") {
              updated.properties.x += dx;
              updated.properties.y += dy;
            } else if (updated.type === "line" && updated.properties.points) {
              updated.properties.points = updated.properties.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
            } else if (updated.type === "brush" && updated.properties.points) {
              updated.properties.points = updated.properties.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
            }
            return updated;
          }
          return a;
        }));
      } else if (interaction.kind === "line-end") {
        const updated = { ...interaction.original };
        if (updated.properties.points && updated.properties.points[interaction.index]) {
          updated.properties.points[interaction.index] = { x, y };
          setAnnotations(prev => prev.map(a => a.id === interaction.annId ? updated : a));
        }
      }
    }
  }, [isDrawing, selectedTool, lineTool, rectTool, brushTool, toLocalPoint, interaction, setAnnotations]);

  const handleMouseUp = useCallback(() => {
    if (selectedTool === "line") lineTool.onMouseUp();
    else if (selectedTool === "rectangle" || selectedTool === "polygon") rectTool.onMouseUp();
    else if (selectedTool === "brush") brushTool.onMouseUp();
    setIsDrawing(false);
    setInteraction(null);
  }, [selectedTool, lineTool, rectTool, brushTool, setIsDrawing]);

  // Calculate canvas dimensions
  const canvasWidth = imageDimensions.width * pixelScale;
  const canvasHeight = imageDimensions.height * pixelScale;

  return (
    <div className="flex-1 bg-gray-100 relative overflow-hidden">
      <div className="h-full overflow-auto">
        <div 
          ref={containerRef}
          className="min-h-full flex items-center justify-center p-8"
          onClick={handleCanvasClick}
        >
          <div 
            className="annotation-canvas bg-white shadow-lg relative"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              minWidth: 400,
              minHeight: 300
            }}
          >
            {/* Background Image */}
            {projectImage?.imageUrl ? (
              <>
                <img
                  src={projectImage.imageUrl}
                  alt={projectImage.name || "Project Image"}
                  className="absolute inset-0 w-full h-full object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{
                    display: imageError ? 'none' : 'block'
                  }}
                />
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <div className="text-lg mb-2">⚠️</div>
                      <div className="text-sm">Failed to load image</div>
                      <div className="text-xs mt-1">{projectImage.name}</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <div className="text-lg mb-2">📷</div>
                  <div className="text-sm">No image available</div>
                  <div className="text-xs mt-1">Upload an image to start annotating</div>
                </div>
              </div>
            )}

            {/* SVG Overlay for Annotations */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: selectedTool === "move" ? "auto" : "auto" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Render existing annotations */}
              {annotations.map((a) => (
                <g key={a.id} data-ann-id={a.id}>
                  {(() => {
                    if (a.type === "rectangle" && typeof a.properties.width === "number" && typeof a.properties.height === "number") {
                      return (
                        <rect
                          x={a.properties.x}
                          y={a.properties.y}
                          width={Math.abs(a.properties.width)}
                          height={Math.abs(a.properties.height)}
                          fill="none"
                          stroke={selectedColor}
                          strokeWidth={2}
                          className={selectedAnnotationId === a.id ? "stroke-blue-500" : ""}
                        />
                      );
                    } else if (a.type === "line" && a.properties.points && a.properties.points.length >= 2) {
                      const [p1, p2] = a.properties.points;
                      return (
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={selectedColor}
                          strokeWidth={2}
                          className={selectedAnnotationId === a.id ? "stroke-blue-500" : ""}
                        />
                      );
                    } else if (a.type === "brush" && a.properties.points && a.properties.points.length > 1) {
                      const pathData = a.properties.points.reduce((path, point, index) => {
                        return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`;
                      }, "");
                      return (
                        <path
                          d={pathData}
                          fill="none"
                          stroke={selectedColor}
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={selectedAnnotationId === a.id ? "stroke-blue-500" : ""}
                        />
                      );
                    }
                    return null;
                  })()}
                </g>
              ))}

              {/* Render current annotation being drawn */}
              {currentAnnotation && (
                <g>
                  {(() => {
                    if (currentAnnotation.type === "rectangle" && typeof currentAnnotation.properties.width === "number" && typeof currentAnnotation.properties.height === "number") {
                      return (
                        <rect
                          x={currentAnnotation.properties.x}
                          y={currentAnnotation.properties.y}
                          width={Math.abs(currentAnnotation.properties.width)}
                          height={Math.abs(currentAnnotation.properties.height)}
                          fill="none"
                          stroke={selectedColor}
                          strokeWidth={2}
                          strokeDasharray="5,5"
                        />
                      );
                    } else if (currentAnnotation.type === "line" && currentAnnotation.properties.points && currentAnnotation.properties.points.length >= 2) {
                      const [p1, p2] = currentAnnotation.properties.points;
                      return (
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={selectedColor}
                          strokeWidth={2}
                          strokeDasharray="5,5"
                        />
                      );
                    } else if (currentAnnotation.type === "brush" && currentAnnotation.properties.points && currentAnnotation.properties.points.length > 1) {
                      const pathData = currentAnnotation.properties.points.reduce((path, point, index) => {
                        return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`;
                      }, "");
                      return (
                        <path
                          d={pathData}
                          fill="none"
                          stroke={selectedColor}
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    }
                    return null;
                  })()}
                </g>
              )}

              {/* Selection handles for selected annotation */}
              {selectedAnnotationId ? (() => {
                const a = annotations.find(ann => ann.id === selectedAnnotationId);
                if (!a) return null;
                if (a.type === "rectangle" && typeof a.properties.width === "number" && typeof a.properties.height === "number") {
                  const corners = [
                    { x: a.properties.x, y: a.properties.y },
                    { x: (a.properties.x || 0) + a.properties.width, y: a.properties.y },
                    { x: (a.properties.x || 0) + a.properties.width, y: (a.properties.y || 0) + a.properties.height },
                    { x: a.properties.x, y: (a.properties.y || 0) + a.properties.height }
                  ];
                  return (
                    <g>
                      {corners.map((corner, i) => (
                        <circle key={i} cx={corner.x} cy={corner.y} r={5} fill="#3B82F6" cursor="pointer" />
                      ))}
                    </g>
                  );
                } else if (a.type === "line" && a.properties.points && a.properties.points.length >= 2) {
                  const [p1, p2] = a.properties.points;
                  const r = 5;
                  return (
                    <g>
                      <circle cx={p1.x} cy={p1.y} r={r} fill="#3B82F6" cursor="grab"
                        onMouseDown={(ev) => { ev.stopPropagation(); const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY); setInteraction({ kind: "line-end", annId: a.id, index: 0, start: { x: lx, y: ly }, original: JSON.parse(JSON.stringify(a)) }); setIsDrawing(true); }} />
                      <circle cx={p2.x} cy={p2.y} r={r} fill="#3B82F6" cursor="grab"
                        onMouseDown={(ev) => { ev.stopPropagation(); const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY); setInteraction({ kind: "line-end", annId: a.id, index: 1, start: { x: lx, y: ly }, original: JSON.parse(JSON.stringify(a)) }); setIsDrawing(true); }} />
                    </g>
                  );
                }
                return null;
              })() : null}
            </svg>
            {selectedTool === "text" ? textTool.overlay : null}
          </div>

          {/* Zoom Controls */}
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
  );
}