import React from "react";
import type { Annotation } from "../../types";

interface ShapeAnnotationProps {
  annotation: Annotation;
}

export default function ShapeAnnotation({ annotation }: ShapeAnnotationProps) {
  const { properties } = annotation;
  const style = properties.style || {};
  if (annotation.type === "rectangle" && properties.position) {
    const x = properties.position.x;
    const y = properties.position.y;
    const w = properties.width || 0;
    const h = properties.height || 0;
    return (
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={style.color || "#111"} strokeWidth={style.strokeWidth || 2} pointerEvents="auto" />
    );
  }
  return null;
}


