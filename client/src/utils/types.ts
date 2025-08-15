// Database schema types
export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  createdAt?: string;
}

export interface Team {
  id: number;
  ownerId: number;
  name: string;
  createdAt?: string;
}

export interface Project {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  createdAt?: string;
}

export interface Image {
  id: number;
  projectId: number;
  filename: string;
  url: string;
  width: number;
  height: number;
  uploadedAt?: string;
}

export interface Label {
  id: number;
  projectId: number;
  name: string;
  colour: string;
  createdAt?: string;
}

export interface Annotation {
  id: number;
  imageId: number;
  labelId: number;
  createdBy: number;
  shapeData: string;
  createdAt?: string;
}

export interface TeamMember {
  teamId: number;
  userId: number;
  role: string;
  createdAt?: string;
}

export interface ProjectShare {
  projectId: number;
  teamId: number;
  permission: string;
  sharedAt?: string;
}

// UI Types
export interface AnnotationShape {
  type: 'point' | 'rectangle' | 'line' | 'polygon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Array<{x: number, y: number}>;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}