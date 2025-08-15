export const ROUTES = {
  LOGIN: '/login',
  PROJECTS: '/',
  ANNOTATION: '/annotation/:projectId',
} as const;

export const MODAL_TYPES = {
  CREATE_PROJECT: 'create-project',
  SHARE_PROJECT: 'share-project',
  EXPORT_PROJECT: 'export-project',
} as const;

export const COLORS = {
  PRIMARY: '#22c55e',
  SECONDARY: '#6b7280',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  SUCCESS: '#10b981',
} as const;

export const EXPORT_FORMATS = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Standard JSON format for AI training',
    icon: '{ }'
  },
  {
    id: 'xml',
    name: 'XML',
    description: 'XML format with nested annotations',
    icon: '</>'
  },
  {
    id: 'txt',
    name: 'TXT',
    description: 'Simple text format with coordinates',
    icon: 'TXT'
  }
] as const;

export const ANNOTATION_TOOLS = [
  { id: 'select', name: 'Select', icon: 'MousePointer' },
  { id: 'point', name: 'Point', icon: 'Circle' },
  { id: 'line', name: 'Line', icon: 'Minus' },
  { id: 'rectangle', name: 'Rectangle', icon: 'Square' },
  { id: 'polygon', name: 'Polygon', icon: 'Pentagon' },
] as const;