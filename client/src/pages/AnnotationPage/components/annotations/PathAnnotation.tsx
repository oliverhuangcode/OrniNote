import React from "react";
import type { Annotation } from "../../types";

interface PathAnnotationProps {
  annotation: Annotation;
}

export default function PathAnnotation({ annotation }: PathAnnotationProps) {
  const pts = annotation.properties.points || [];
  if (pts.length < 2) return null;
  const d = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  const style = annotation.properties.style || {};
  return <path d={d} fill="none" stroke={style.color || "#111"} strokeWidth={style.strokeWidth || 3} strokeLinecap="round" strokeLinejoin="round" />;
}


