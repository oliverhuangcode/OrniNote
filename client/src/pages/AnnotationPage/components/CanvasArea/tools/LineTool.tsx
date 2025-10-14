import React, { useCallback, useState } from "react";
import type { Annotation } from "../../../types";

// Accept color as a required argument
export function useLineTool(onCreate: (annotation: Annotation) => void, imageId: string, color: string, options?: { strokeWidth?: number }) {
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<React.ReactNode | null>(null);

  const strokeWidth = options?.strokeWidth || 2;

  const onMouseDown = useCallback((x: number, y: number) => {
    setStart({ x, y });
  }, []);

  const onMouseMove = useCallback((x: number, y: number) => {
    if (!start) return;
    setPreview(
      <line
        x1={start.x}
        y1={start.y}
        x2={x}
        y2={y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="4 2"
      />
    );
  }, [start, color, strokeWidth]);

  const onMouseUp = useCallback((x: number, y: number) => {
    if (!start) return;
    const ann: Annotation = {
      id: crypto.randomUUID(),
      imageId,
      type: "line",
      labelId: "",
      properties: {
        points: [start, { x, y }],
        style: { color, strokeWidth }
      }
    };
    onCreate(ann);
    setStart(null);
    setPreview(null);
  }, [onCreate, start, color, strokeWidth]);

  return { onMouseDown, onMouseMove, onMouseUp, preview };
}

export default useLineTool;


