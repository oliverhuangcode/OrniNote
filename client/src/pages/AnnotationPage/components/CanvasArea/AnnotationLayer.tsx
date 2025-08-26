import React from "react";
import type { Annotation } from "../../types";
import TextAnnotation from "../annotations/TextAnnotation";
import LineAnnotation from "../annotations/LineAnnotation";
import ShapeAnnotation from "../annotations/ShapeAnnotation";
import PathAnnotation from "../annotations/PathAnnotation";

interface AnnotationLayerProps {
  annotations: Annotation[];
  onClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseDown?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseMove?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseUp?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  children?: React.ReactNode; // for previews
}

export default function AnnotationLayer({ annotations, onClick, onMouseDown, onMouseMove, onMouseUp, children }: AnnotationLayerProps) {
  return (
    <svg className="w-full h-full" onClick={onClick} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      {annotations.map(a => (
        <g key={a.id} data-ann-id={a.id}>
          {a.type === "text" ? <TextAnnotation annotation={a} /> : null}
          {a.type === "line" ? <LineAnnotation annotation={a} /> : null}
          {a.type === "rectangle" ? <ShapeAnnotation annotation={a} /> : null}
          {a.type === "path" ? <PathAnnotation annotation={a} /> : null}
        </g>
      ))}
      {children}
    </svg>
  );
}


