import React, { useCallback, useState } from "react";
import type { Annotation } from "../../../types";

export function useBrushTool(onCreate: (annotation: Annotation) => void, options?: { color?: string; strokeWidth?: number }) {
  const [pathData, setPathData] = useState<string | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  const color = options?.color || "#5CBF7D";
  const strokeWidth = options?.strokeWidth || 3;

  const onMouseDown = useCallback((x: number, y: number) => {
    setPoints([{ x, y }]);
    setPathData(`M ${x} ${y}`);
  }, []);

  const onMouseMove = useCallback((x: number, y: number) => {
    if (!pathData) return;
    setPoints(prev => {
      const np = [...prev, { x, y }];
      setPathData(p => (p ? `${p} L ${x} ${y}` : `M ${x} ${y}`));
      return np;
    });
  }, [pathData]);

  const onMouseUp = useCallback(() => {
    if (!pathData || points.length < 2) {
      setPathData(null);
      setPoints([]);
      return;
    }
    const ann: Annotation = {
      id: crypto.randomUUID(),
      type: "path",
      properties: { points: points.slice(), style: { color, strokeWidth } },
    };
    onCreate(ann);
    setPathData(null);
    setPoints([]);
  }, [color, onCreate, pathData, points, strokeWidth]);

  const preview = pathData ? (
    <path d={pathData} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  ) : null;

  return { onMouseDown, onMouseMove, onMouseUp, preview };
}

export default useBrushTool;

