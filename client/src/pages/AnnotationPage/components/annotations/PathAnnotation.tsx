import React from "react";
import type { Annotation } from "../../types";

interface PathAnnotationProps {
  annotation: Annotation;
}

export default function PathAnnotation({ annotation }: PathAnnotationProps) {
  const pts = annotation.properties.points || [];
  if (pts.length < 2) return null;

  const d =
    `M ${pts[0].x} ${pts[0].y} ` +
    pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");

  const style = annotation.properties.style || {};
  const color = style.color || "#111";
  const strokeWidth = style.strokeWidth ?? 3;

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="stroke"             // <- crucial
      vectorEffect="non-scaling-stroke"  // <- keeps hit area consistent on zoom
      style={{ cursor: "move" }}
    />
  );
}
