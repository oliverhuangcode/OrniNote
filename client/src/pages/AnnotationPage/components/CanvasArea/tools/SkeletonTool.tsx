import React, { useCallback, useState } from "react";
import type { Annotation } from "../../../types";

interface SkeletonPoint {
  x: number;
  y: number;
  labelId: string;
  labelName: string;
  color: string;
}

interface SkeletonEdge {
  from: number;
  to: number;
  labelId: string;
  labelName: string;
  color: string;
}

export function useSkeletonTool(
  onCreate: (annotation: Annotation) => void,
  imageId: string,
  currentLabelId: string,
  currentLabelName: string,
  currentColor: string,
  onLabelAdvance?: () => void
) {
  const [points, setPoints] = useState<SkeletonPoint[]>([]);
  const [edges, setEdges] = useState<SkeletonEdge[]>([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [lastLabelId, setLastLabelId] = useState<string | null>(null);

  // Check if click is near a point
  const getClickedPointIndex = useCallback(
    (x: number, y: number): number | null => {
      const threshold = 10;
      for (let i = 0; i < points.length; i++) {
        const dist = Math.hypot(points[i].x - x, points[i].y - y);
        if (dist < threshold) {
          return i;
        }
      }
      return null;
    },
    [points]
  );

  // Handle click on canvas
  const onClick = useCallback(
    (x: number, y: number, clickedPointIndex: number | null = null) => {
      if (!currentLabelId) {
        alert("Please select a label first");
        return;
      }

      // If clicking on an existing point, select it
      if (clickedPointIndex !== null) {
        setSelectedPointIndex(clickedPointIndex);
        return;
      }

      // Check if this is the first point with a new label
      const isFirstPointOfNewLabel = lastLabelId !== currentLabelId;

      // Create new point
      const newPoint: SkeletonPoint = {
        x,
        y,
        labelId: currentLabelId,
        labelName: currentLabelName,
        color: currentColor,
      };

      // If we have a selected point, create an edge from it to the new point
      if (selectedPointIndex !== null) {
        const newEdge: SkeletonEdge = {
          from: selectedPointIndex,
          to: points.length,
          labelId: currentLabelId,
          labelName: currentLabelName,
          color: currentColor,
        };
        setEdges((prev) => [...prev, newEdge]);
        setSelectedPointIndex(points.length); // Select the new point
      } else if (points.length > 0) {
        // Auto-connect to previous point
        const newEdge: SkeletonEdge = {
          from: points.length - 1,
          to: points.length,
          labelId: currentLabelId,
          labelName: currentLabelName,
          color: currentColor,
        };
        setEdges((prev) => [...prev, newEdge]);
      }

      setPoints((prev) => [...prev, newPoint]);
      setLastLabelId(currentLabelId);

      // Auto-advance to next label after first point of new label
      if (isFirstPointOfNewLabel && onLabelAdvance) {
        onLabelAdvance();
      }
    },
    [currentLabelId, currentLabelName, currentColor, points.length, selectedPointIndex, lastLabelId, onLabelAdvance]
  );

  // Finish and save skeleton
  const finish = useCallback(() => {
    if (points.length === 0) return;

    const ann: Annotation = {
      id: crypto.randomUUID(),
      imageId,
      type: "skeleton",
      labelId: "",
      properties: {
        skeletonPoints: points,
        skeletonEdges: edges,
        style: { strokeWidth: 2 },
      },
    };
    onCreate(ann);
    setPoints([]);
    setEdges([]);
    setSelectedPointIndex(null);
    setLastLabelId(null);
  }, [points, edges, imageId, onCreate]);

  // Preview rendering
  const preview = (
    <g>
      {/* Draw edges */}
      {edges.map((edge, i) => {
        const fromPoint = points[edge.from];
        const toPoint = points[edge.to];
        if (!fromPoint || !toPoint) return null;
        return (
          <line
            key={`edge-${i}`}
            x1={fromPoint.x}
            y1={fromPoint.y}
            x2={toPoint.x}
            y2={toPoint.y}
            stroke={edge.color}
            strokeWidth={2}
          />
        );
      })}
      {/* Draw points */}
      {points.map((p, i) => (
        <circle
          key={`point-${i}`}
          cx={p.x}
          cy={p.y}
          r={selectedPointIndex === i ? 8 : 6}
          fill={p.color}
          stroke="#fff"
          strokeWidth={2}
          style={{ cursor: "pointer" }}
        />
      ))}
    </g>
  );

  // Clear skeleton
  const clear = () => {
    setPoints([]);
    setEdges([]);
    setSelectedPointIndex(null);
    setLastLabelId(null);
  };

  return { onClick, preview, points, edges, clear, finish, getClickedPointIndex };
}

export default useSkeletonTool;