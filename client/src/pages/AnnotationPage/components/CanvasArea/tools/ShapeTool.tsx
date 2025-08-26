import React, { useCallback, useState } from "react";
import type { Annotation } from "../../../types";

export type ShapeKind = "rectangle";

export function useShapeTool(kind: ShapeKind, onCreate: (annotation: Annotation) => void) {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<React.ReactNode | null>(null);

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
      setPreview(<rect x={x0} y={y0} width={w} height={h} fill="none" stroke="#5CBF7D" strokeWidth={2} strokeDasharray="4 2" />);
    }
  }, [kind, origin]);

  const onMouseUp = useCallback((x: number, y: number) => {
    if (!origin) return;
    if (kind === "rectangle") {
      const x0 = Math.min(origin.x, x);
      const y0 = Math.min(origin.y, y);
      const w = Math.abs(x - origin.x);
      const h = Math.abs(y - origin.y);
      const ann: Annotation = { id: crypto.randomUUID(), type: "rectangle", properties: { position: { x: x0, y: y0 }, width: w, height: h, style: { color: "#5CBF7D", strokeWidth: 2 } } };
      onCreate(ann);
    }
    setOrigin(null);
    setPreview(null);
  }, [kind, onCreate, origin]);

  return { onMouseDown, onMouseMove, onMouseUp, preview };
}

export default useShapeTool;


