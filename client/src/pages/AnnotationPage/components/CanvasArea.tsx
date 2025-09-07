import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Annotation } from "../types";
import AnnotationLayer from "./CanvasArea/AnnotationLayer";
import useTextTool from "./CanvasArea/tools/TextTool";
import useLineTool from "./CanvasArea/tools/LineTool";
import useShapeTool from "./CanvasArea/tools/ShapeTool";
import useBrushTool from "./CanvasArea/tools/BrushTool";
import usePenTool from "./CanvasArea/tools/PenTool";

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
}

export default function CanvasArea({ zoomPercent, onZoom, selectedTool, annotations, setAnnotations, currentAnnotation, setCurrentAnnotation, isDrawing, setIsDrawing, selectedAnnotationId, setSelectedAnnotationId, selectedColor, }: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomLayerRef = useRef<HTMLDivElement | null>(null);
  const pixelScale = useMemo(() => (zoomPercent / 100), [zoomPercent]);

  // Hooked tools
  const addAnnotation = useCallback((a: Annotation) => setAnnotations(prev => [...prev, a]), [setAnnotations]);
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

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = toLocalPoint(e.clientX, e.clientY);
    if (selectedTool === "line") lineTool.onMouseDown(x, y);
    if (selectedTool === "marquee") {
  setMarqueeStart({ x, y });
  setMarqueeRect({ x, y, w: 0, h: 0 });
  setIsDrawing(true);
  return;
}
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
    else if (selectedTool === "marquee" && isDrawing && marqueeStart) {
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
    else if (selectedTool === "move" && interaction) {
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
    } else if (selectedTool === "marquee" && groupSelection.length > 0 && isDrawing) {
      // On mouse move, calculate dx, dy and move all selected annotations
      const dx = x - (marqueeStart?.x || 0);
      const dy = y - (marqueeStart?.y || 0);
      setAnnotations(prev =>
        prev.map(a => {
          if (!groupSelection.includes(a.id)) return a;
          // Move logic for each type
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
          // Add similar logic for other types
          return a;
        })
      );
    }
  }, [brushTool, isDrawing, lineTool, rectTool, selectedTool, toLocalPoint, interaction, setAnnotations, groupSelection, marqueeStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const { x, y } = toLocalPoint(e.clientX, e.clientY);
    if (selectedTool === "line") lineTool.onMouseUp(x, y);
    else if (selectedTool === "rectangle" || selectedTool === "polygon") rectTool.onMouseUp(x, y);
    else if (selectedTool === "brush") brushTool.onMouseUp();
    setIsDrawing(false);
    setInteraction(null);
  }, [brushTool, isDrawing, lineTool, rectTool, selectedTool, toLocalPoint, setIsDrawing]);

  // Text tool handles its own overlay and commit

  const zoomStyle = useMemo(() => ({ transform: `scale(${pixelScale})`, transformOrigin: "top left" as const }), [pixelScale]);

  function renderAnnotation(a: Annotation) {
    if (selectedTool === "marquee" && isDrawing && marqueeRect) {
  // Find all annotations whose bounding box is inside marqueeRect
  const selectedIds = annotations
    .filter(a => {
      // Compute bounding box for each annotation type
      if (a.type === "rectangle" && a.properties.position) {
        const { x, y } = a.properties.position;
        const w = a.properties.width || 0;
        const h = a.properties.height || 0;
        return (
          x >= marqueeRect.x &&
          y >= marqueeRect.y &&
          x + w <= marqueeRect.x + marqueeRect.w &&
          y + h <= marqueeRect.y + marqueeRect.h
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
      // Add similar logic for lines, etc.
      return false;
    })
    .map(a => a.id);
  setGroupSelection(selectedIds);
  setMarqueeRect(null);
  setMarqueeStart(null);
  setIsDrawing(false);
  return;
}
    if (a.type === "polygon") return penTool.render(a);
    if (a.type === "rectangle" && a.properties.position) {
      const { x, y } = a.properties.position;
      const w = a.properties.width || 0;
      const h = a.properties.height || 0;
      const style = a.properties.style || {};
      return (
        <rect
          key={a.id}
          x={x}
          y={y}
          width={w}
          height={h}
          fill="none"
          stroke={style.color || "#3B3B3B"}
          strokeWidth={style.strokeWidth || 2}
        />
      );
    }
    if (a.type === "line" && a.properties.points && a.properties.points.length >= 2) {
      const [p1, p2] = a.properties.points;
      const style = a.properties.style || {};
      return (
        <line
          key={a.id}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke={style.color || "#3B3B3B"}
          strokeWidth={style.strokeWidth || 2}
        />
      );
    }
    if (a.type === "path" && a.properties.points) {
      const style = a.properties.style || {};
      const d = a.properties.points.reduce(
        (acc: string, p: { x: number; y: number }, i: number) =>
          acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
        ""
      );
      return (
        <path
          key={a.id}
          d={d}
          fill="none"
          stroke={style.color || "#3B3B3B"}
          strokeWidth={style.strokeWidth || 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
    if (a.type === "text" && a.properties.position) {
      const { x, y } = a.properties.position;
      const style = a.properties.style || {};
      return (
        <text
          key={a.id}
          x={x}
          y={y}
          fill={style.color || "#3B3B3B"}
          fontSize={style.fontSize || 16}
          fontFamily={style.fontFamily || "Inter, system-ui, sans-serif"}
        >
          {a.properties.text}
        </text>
      );
    }
    return null;
  }

  return (
    <div className="flex-1 bg-gray-200 overflow-hidden relative">
      <div className="absolute inset-0 flex items-center justify-center p-4" ref={containerRef}>
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden w-full h-full max-w-4xl max-h-full">
          <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
            <div ref={zoomLayerRef} className="absolute inset-0" style={zoomStyle}>
              <AnnotationLayer
                annotations={annotations}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                marqueeRect={marqueeRect}
              >
                {selectedTool === "pen" && penTool.preview}
                {selectedTool === "line" && lineTool.preview}
                {(selectedTool === "rectangle" || selectedTool === "polygon") && rectTool.preview}
                {selectedTool === "brush" && brushTool.preview}
                {selectedAnnotationId ? (() => {
                  const a = annotations.find(x => x.id === selectedAnnotationId);
                  if (!a) return null;
                  if (a.type === "rectangle" && a.properties.position) {
                    const x = a.properties.position.x; const y = a.properties.position.y;
                    const w = a.properties.width || 0; const h = a.properties.height || 0;
                    const handleSize = 6; const hs = handleSize;
                    const nw = { x, y }, ne = { x: x + w, y }, sw = { x, y: y + h }, se = { x: x + w, y: y + h };
                    return (
                      <g>
                        <rect x={x} y={y} width={w} height={h} fill="none" stroke="#3B82F6" strokeWidth={1} strokeDasharray="4 2" pointerEvents="none" />
                        <rect x={nw.x - hs/2} y={nw.y - hs/2} width={hs} height={hs} fill="#3B82F6" cursor="nwse-resize"
                          onMouseDown={(ev) => { ev.stopPropagation(); const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY); setInteraction({ kind: "resize-rect", annId: a.id, handle: "nw", start: { x: lx, y: ly }, original: JSON.parse(JSON.stringify(a)) }); setIsDrawing(true); }} />
                        <rect x={ne.x - hs/2} y={ne.y - hs/2} width={hs} height={hs} fill="#3B82F6" cursor="nesw-resize"
                          onMouseDown={(ev) => { ev.stopPropagation(); const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY); setInteraction({ kind: "resize-rect", annId: a.id, handle: "ne", start: { x: lx, y: ly }, original: JSON.parse(JSON.stringify(a)) }); setIsDrawing(true); }} />
                        <rect x={sw.x - hs/2} y={sw.y - hs/2} width={hs} height={hs} fill="#3B82F6" cursor="nesw-resize"
                          onMouseDown={(ev) => { ev.stopPropagation(); const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY); setInteraction({ kind: "resize-rect", annId: a.id, handle: "sw", start: { x: lx, y: ly }, original: JSON.parse(JSON.stringify(a)) }); setIsDrawing(true); }} />
                        <rect x={se.x - hs/2} y={se.y - hs/2} width={hs} height={hs} fill="#3B82F6" cursor="nwse-resize"
                          onMouseDown={(ev) => { ev.stopPropagation(); const { x: lx, y: ly } = toLocalPoint((ev as any).clientX, (ev as any).clientY); setInteraction({ kind: "resize-rect", annId: a.id, handle: "se", start: { x: lx, y: ly }, original: JSON.parse(JSON.stringify(a)) }); setIsDrawing(true); }} />
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
              </AnnotationLayer>
            </div>
            {selectedTool === "text" ? textTool.overlay : null}
          </div>

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



