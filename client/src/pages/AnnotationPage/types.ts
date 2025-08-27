export interface ToolbarTool {
  id: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isSelected?: boolean;
}

export interface Layer {
  id: string;
  name: string;
  color?: string;
  visible: boolean;
  locked: boolean;
}

export interface ActiveFile {
  id: string;
  name: string;
  isActive: boolean;
}


// Annotation types for SVG-based tools
export type AnnotationType = "text" | "line" | "rectangle" | "polygon" | "path";

export interface Point {
  x: number;
  y: number;
}

export interface AnnotationStyle {
  color?: string;
  fontSize?: number;
  strokeWidth?: number;
  fontFamily?: string;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  layerId?: string;
  properties: {
    position?: Point; // for text or rectangle origin
    points?: Point[]; // for line/polyline/polygon
    text?: string; // for text annotations
    width?: number; // rectangle width
    height?: number; // rectangle height
    style?: AnnotationStyle;
  };
}



