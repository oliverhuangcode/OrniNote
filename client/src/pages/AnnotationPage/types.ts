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
  label: string;
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
  imageId: string;
  type: "rectangle" | "line" | "brush" | "text" | "polygon" | "path" | "skeleton";
  labelId: string; // MOVE THIS from properties to root level
  labelName?: string; // Optional, for display
  createdBy?: string; // Optional, for display
  properties: {
    position?: Point; // for text or rectangle origin
    points?: Point[]; // for line/polyline/polygon
    skeletonPoints?: Array<{x: number; y: number; labelId: string; labelName: string; color: string}>; // for skeleton keypoints
    skeletonEdges?: Array<{from: number; to: number; labelId: string; labelName: string; color: string}>; // for skeleton connections
    text?: string; // for text annotations
    width?: number; // rectangle width
    height?: number; // rectangle height
    style?: Style;
    className?: string;
    x?: number;
    y?: number;
    color?: string;
  };
}

// Image data interface for uploading
export interface ImageData {
  imageUrl: string;
  imageFilename: string;
  imageWidth: number;
  imageHeight: number;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  images: Array<{
    _id: string;
    filename: string;
    url: string;
    width: number;
    height: number;
    uploadedAt: string;
  }>;
  collaborators: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: string;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectData {
  name: string;
  width: number;
  height: number;
  imageUrl?: string;
  imageFilename?: string;
  teamMembers: string[];
}