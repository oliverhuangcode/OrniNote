import React, { useCallback, useState } from "react";
import type { Annotation } from "../../../types";

export type ShapeKind = "rectangle";

// Add color and options as arguments
export function useShapeTool(
  kind: ShapeKind,
  onCreate: (annotation: Annotation) => void,
  color: string,
  options?: { strokeWidth?: number }
) {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<React.ReactNode | null>(null);

  const strokeWidth = options?.strokeWidth || 2;

  const onMouseDown = useCallback((x: number, y: number) => {
    setOrigin({ x, y });
  }, []);

  const onMouseMove = useCallback((x: number, y: number) => {
    if (!origin) return;
    if (kind === "rectangle") {
      const x0 = Math.min(origin.x, x);
      const y0 = Math.min(origin.y, y);
      const w = Math.abs(x - origin.x);
      const h = Math.abs(y - origin.y);
      setPreview(
        <rect
          x={x0}
          y={y0}
          width={w}
          height={h}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="4 2"
        />
      );
    }
  }, [kind, origin, color, strokeWidth]);

  const onMouseUp = useCallback((x: number, y: number) => {
    if (!origin) return;
    if (kind === "rectangle") {
      const x0 = Math.min(origin.x, x);
      const y0 = Math.min(origin.y, y);
      const w = Math.abs(x - origin.x);
      const h = Math.abs(y - origin.y);
      const ann: Annotation = {
        id: crypto.randomUUID(),
        type: "rectangle",
        properties: {
          position: { x: x0, y: y0 },
          width: w,
          height: h,
          style: { color, strokeWidth }
        }
      };
      onCreate(ann);
    }
    setOrigin(null);
    setPreview(null);
  }, [kind, onCreate, origin, color, strokeWidth]);

  return { onMouseDown, onMouseMove, onMouseUp, preview };
}

export default useShapeTool;


