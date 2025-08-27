import React from "react";
import type { Annotation } from "../../types";

interface TextAnnotationProps {
  annotation: Annotation;
}

export default function TextAnnotation({ annotation }: TextAnnotationProps) {
  const pos = annotation.properties.position;
  const text = annotation.properties.text;
  const style = annotation.properties.style || {};
  if (!pos || !text) return null;
  return (
    <text x={pos.x} y={pos.y} fill={style.color || "#111"} fontSize={style.fontSize || 16} fontFamily={style.fontFamily || "sans-serif"} pointerEvents="auto">
      {text}
    </text>
  );
}


