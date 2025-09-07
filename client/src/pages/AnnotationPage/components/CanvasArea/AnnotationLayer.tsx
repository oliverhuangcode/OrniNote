import React from "react";
import type { Annotation } from "../../types";
import TextAnnotation from "../annotations/TextAnnotation";
import LineAnnotation from "../annotations/LineAnnotation";
import ShapeAnnotation from "../annotations/ShapeAnnotation";
import PathAnnotation from "../annotations/PathAnnotation";

// Reusable lighten function
function lighten(hex: string, amt = 0.3) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const num = parseInt(c, 16);
  let r = Math.min(255, Math.round(((num >> 16) & 0xff) + 255 * amt));
  let g = Math.min(255, Math.round(((num >> 8) & 0xff) + 255 * amt));
  let b = Math.min(255, Math.round((num & 0xff) + 255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

interface AnnotationLayerProps {
  annotations: Annotation[];
  onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseDown?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseMove?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseUp?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  children?: React.ReactNode; // for previews
  marqueeRect?: { x: number; y: number; w: number; h: number } | null; // <-- add this
}

export default function AnnotationLayer({
  annotations,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  children,
  marqueeRect, // <-- add this
}: AnnotationLayerProps) {
  return (
    <svg className="w-full h-full" onClick={onClick} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      {annotations.map(a => (
        <g key={a.id} data-ann-id={a.id}>
          {a.type === "text" ? <TextAnnotation annotation={a} /> : null}
          {a.type === "line" ? <LineAnnotation annotation={a} /> : null}
          {a.type === "rectangle" ? (() => {
            const color = a.properties.style?.color || "#13ba83";
            const fill = lighten(color, 0.3) + "55";
            return (
              <rect
                x={a.properties.position?.x}
                y={a.properties.position?.y}
                width={a.properties.width}
                height={a.properties.height}
                fill={fill}
                stroke={color}
                strokeWidth={a.properties.style?.strokeWidth || 2}
              />
            );
          })() : null}
          {a.type === "path" ? <PathAnnotation annotation={a} /> : null}
          {a.type === "polygon" ? (() => {
            const color = a.properties.style?.color || "#13ba83";
            const fill = lighten(color, 0.3) + "55";
            return (
              <polygon
                points={(a.properties.points ?? []).map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(" ")}
                fill={fill}
                stroke={color}
                strokeWidth={a.properties.style?.strokeWidth || 2}
                pointerEvents="all"
                cursor="move"
              />
            );
          })() : null}
        </g>
      ))}
      {children}
      {marqueeRect && (
        <rect
          x={marqueeRect.x}
          y={marqueeRect.y}
          width={marqueeRect.w}
          height={marqueeRect.h}
          fill="none"
          stroke="#13ba83"
          strokeWidth={2}
          strokeDasharray="6 4"
          pointerEvents="none"
        />
      )}
    </svg>
  );
}


