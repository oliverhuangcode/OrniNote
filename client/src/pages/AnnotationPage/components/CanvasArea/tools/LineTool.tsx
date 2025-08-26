import React, { useCallback, useState } from "react";
import type { Annotation } from "../../../types";

export function useLineTool(onCreate: (annotation: Annotation) => void) {
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<React.ReactNode | null>(null);

  const onMouseDown = useCallback((x: number, y: number) => {
    setStart({ x, y });
  }, []);

  const onMouseMove = useCallback((x: number, y: number) => {
    if (!start) return;
    setPreview(<line x1={start.x} y1={start.y} x2={x} y2={y} stroke="#5CBF7D" strokeWidth={2} strokeDasharray="4 2" />);
  }, [start]);

  const onMouseUp = useCallback((x: number, y: number) => {
    if (!start) return;
    const ann: Annotation = { id: crypto.randomUUID(), type: "line", properties: { points: [start, { x, y }], style: { color: "#5CBF7D", strokeWidth: 2 } } };
    onCreate(ann);
    setStart(null);
    setPreview(null);
  }, [onCreate, start]);

  return { onMouseDown, onMouseMove, onMouseUp, preview };
}

export default useLineTool;


