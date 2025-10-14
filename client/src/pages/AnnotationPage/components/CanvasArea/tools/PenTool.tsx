import React, { useCallback, useState } from "react";
import type { Annotation } from "../../../types";

// Pen tool for drawing polygons by clicking points, closes on clicking the first point
export function usePenTool(
  onCreate: (annotation: Annotation) => void,
  imageId: string,
  color: string,
  options?: { strokeWidth?: number }
) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const strokeWidth = options?.strokeWidth || 2;

  // Add a point or close the polygon if clicking the first point
  const onClick = useCallback((x: number, y: number) => {
    if (points.length > 2) {
      const first = points[0];
      const dist = Math.hypot(first.x - x, first.y - y);
      if (dist < 10) { // 10px threshold to close
        setIsClosed(true);
        // Create the polygon annotation
        const ann: Annotation = {
          id: crypto.randomUUID(),
          imageId,
          type: "polygon",
          labelId: "",
          properties: {
            points: [...points, first], // close the shape
            style: { color, strokeWidth }
          }
        };
        onCreate(ann);
        setPoints([]);
        setIsClosed(false);
        return;
      }
    }
    setPoints(prev => [...prev, { x, y }]);
  }, [points, color, strokeWidth, onCreate]);

  // For previewing the current polygon
  const preview = points.length > 0 ? (
    <g>
      {/* Draw the polygon border if closed, otherwise a polyline */}
      {isClosed ? (
        <polygon
          points={points.concat([points[0]]).map(p => `${p.x},${p.y}`).join(" ")}
          fill="rgba(19,186,131,0.1)"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      ) : (
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      )}
      {/* Draw points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={6}
          fill={i === 0 ? "#fff" : color}
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </g>
  ) : null;

  // Render function for displaying the finished polygon annotation
  function render(annotation: Annotation) {
    if (annotation.type !== "polygon" || !annotation.properties?.points) return null;
    const pts = annotation.properties.points;
    const style = annotation.properties.style || {};
    return (
      <polygon
        points={pts.map(p => `${p.x},${p.y}`).join(" ")}
        fill="rgba(19,186,131,0.1)"
        stroke={style.color || "#13ba83"}
        strokeWidth={style.strokeWidth || 2}
      />
    );
  }

  // Clear points (for ESC key, etc)
  const clear = () => setPoints([]);

  return { onClick, preview, points, clear, render };
}

export default usePenTool;