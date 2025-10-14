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
  onClick: (...args: any[]) => void;
  onMouseDown: (...args: any[]) => void;
  onMouseMove: (...args: any[]) => void;
  onMouseUp: (...args: any[]) => void;
  marqueeRect?: { x: number; y: number; w: number; h: number } | null;
  imageUrl?: string;
  imageName?: string;
  imageError?: boolean;
  onImageLoad?: (e: React.SyntheticEvent<SVGImageElement>) => void;
  onImageError?: () => void;
  children?: React.ReactNode;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  marqueeRect,
  imageUrl,
  imageName,
  imageError,
  onImageLoad,
  onImageError,
  children,
}) => {
  const renderAnnotation = (a: Annotation) => {
    switch (a.type) {
      case "text": {
        // Make the (rendered) text selectable via group wrapper below.
        return <TextAnnotation key={a.id} annotation={a} />;
      }

      case "line": {
        // If your <LineAnnotation> draws a <line> or <polyline>,
        // ensure pointerEvents gets passed through (stroke hit).
        return (
          <g key={a.id} pointerEvents="stroke" style={{ cursor: "move" }}>
            <LineAnnotation annotation={a} />
          </g>
        );
      }

      case "rectangle": {
        if (!a.properties.position) return null;
        const rectColor =
          a.properties.style?.color || a.properties.color || "#13ba83";
        const rectFill = lighten(rectColor, 0.3) + "55";
        return (
          <rect
            key={a.id}
            x={a.properties.position.x}
            y={a.properties.position.y}
            width={a.properties.width}
            height={a.properties.height}
            fill={rectFill}
            stroke={rectColor}
            strokeWidth={a.properties.style?.strokeWidth || 2}
            pointerEvents="all"
            cursor="move"
          />
        );
      }

      case "path": {
        // Wrap PathAnnotation to guarantee stroke hit-test.
        return (
          <g key={a.id} pointerEvents="stroke" style={{ cursor: "move" }}>
            <PathAnnotation annotation={a} />
          </g>
        );
      }

      case "brush": {
        if (!a.properties.points || a.properties.points.length === 0) return null;
        const brushColor =
          a.properties.style?.color || a.properties.color || "#13ba83";
        const pathData = a.properties.points.reduce((path, point, index) => {
          return index === 0
            ? `M ${point.x} ${point.y}`
            : `${path} L ${point.x} ${point.y}`;
        }, "");
        return (
          <path
            key={a.id}
            d={pathData}
            fill="none"
            stroke={brushColor}
            strokeWidth={a.properties.style?.strokeWidth || 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="stroke"
            cursor="move"
          />
        );
      }

      case "polygon": {
        if (!a.properties.points) return null;
        const polygonColor =
          a.properties.style?.color || a.properties.color || "#13ba83";
        const polygonFill = lighten(polygonColor, 0.3) + "55";
        return (
          <polygon
            key={a.id}
            points={a.properties.points
              .map((p: { x: number; y: number }) => `${p.x},${p.y}`)
              .join(" ")}
            fill={polygonFill}
            stroke={polygonColor}
            strokeWidth={a.properties.style?.strokeWidth || 2}
            pointerEvents="all"
            cursor="move"
          />
        );
      }

      default:
        return null;
    }
  };

  const renderBackground = () => {
    if (imageUrl) {
      return (
        <g>
          <rect width="100%" height="100%" fill="#f9fafb" />
          {!imageError ? (
            <image
              href={imageUrl}
              x={0}
              y={0}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              onLoad={onImageLoad}
              onError={onImageError}
            />
          ) : (
            <g>
              <rect
                width="100%"
                height="100%"
                fill="#f9fafb"
                stroke="#d1d5db"
                strokeWidth={2}
                strokeDasharray="8 4"
              />
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                fill="#6b7280"
                fontSize="24"
                fontFamily="system-ui, sans-serif"
              >
                ⚠️
              </text>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                fill="#6b7280"
                fontSize="14"
                fontFamily="system-ui, sans-serif"
              >
                Failed to load image
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
                fontFamily="system-ui, sans-serif"
              >
                {imageName || "Unknown file"}
              </text>
            </g>
          )}
        </g>
      );
    }

    // No image placeholder
    return (
      <g>
        <rect
          width="100%"
          height="100%"
          fill="#f9fafb"
          stroke="#d1d5db"
          strokeWidth={2}
          strokeDasharray="8 4"
        />
        <text
          x="50%"
          y="42%"
          textAnchor="middle"
          fill="#6b7280"
          fontSize="24"
          fontFamily="system-ui, sans-serif"
        >
          📷
        </text>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          fill="#6b7280"
          fontSize="14"
          fontFamily="system-ui, sans-serif"
        >
          No image available
        </text>
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="12"
          fontFamily="system-ui, sans-serif"
        >
          Upload an image to start annotating
        </text>
      </g>
    );
  };

  return (
    <svg
      width="100%"
      height="100%"
      style={{ display: "block" }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {renderBackground()}

      {/* Each annotation is wrapped in a <g> that carries data-ann-id for hit-testing. */}
      {annotations.map((a) => (
        <g key={a.id} data-ann-id={a.id}>
          {renderAnnotation(a)}
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
};

export default AnnotationLayer;
