export interface ActiveFile {
  id: string;
  name: string;
  isActive: boolean;
  imageUrl?: string;  // Added for S3 image URL
  width?: number;     // Added for image dimensions
  height?: number;    // Added for image dimensions
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color?: string;
}

export interface ToolbarTool {
  id: string;
  isSelected: boolean;
  icon: React.ReactNode;
}

export interface Point {
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Style {
  color?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface Annotation {
  id: string;
  type: "rectangle" | "line" | "brush" | "text" | "polygon" | "path";
  properties: {
    position?: Point; // for text or rectangle origin
    points?: Point[]; // for line/polyline/polygon
    text?: string; // for text annotations
    width?: number; // rectangle width
    height?: number; // rectangle height
    style?: Style;
    className?: string; // class/category name
    // Basic coordinates (used by some annotation types)
    x?: number;
    y?: number;
    
    // Legacy color property (kept for backward compatibility)
    color?: string;
    labelId?: string;    
    labelName?: string;   
    createdBy?: string; 
  };
}

// Image data interface for uploading
export interface ImageData {
  imageUrl: string;
  imageFilename: string;
  imageWidth: number;
  imageHeight: number;
}