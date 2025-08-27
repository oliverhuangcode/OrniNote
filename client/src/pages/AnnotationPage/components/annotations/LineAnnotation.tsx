import React from "react";
import type { Annotation } from "../../types";

interface LineAnnotationProps {
  annotation: Annotation;
}

export default function LineAnnotation({ annotation }: LineAnnotationProps) {
  const pts = annotation.properties.points || [];
  const style = annotation.properties.style || {};
  if (pts.length < 2) return null;
  const [p1, p2] = pts;
  return (
    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={style.color || "#111"} strokeWidth={style.strokeWidth || 2} pointerEvents="auto" />
  );
}


