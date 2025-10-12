// MongoDB Annotation types based on your actual schema
export interface MongoAnnotation {
  _id: string;
  imageId: string;
  labelId: string;
  createdBy: string;
  shapeData: {
    type: 'rectangle' | 'polygon' | 'line' | 'point' | 'circle';
    coordinates: number[][] | number[]; // Mixed type
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MongoLabel {
  _id: string;
  name: string;
  colour: string;
}

// Frontend annotation format for export operations
export interface FrontendAnnotation {
  id: string;
  type: 'rectangle' | 'polygon' | 'line' | 'text' | 'brush' | 'path' | 'point' | 'circle';
  properties: {
    position?: { x: number; y: number };
    width?: number;
    height?: number;
    points?: Array<{ x: number; y: number }>;
    text?: string;
    label?: string;
    style?: {
      color: string;
      strokeWidth: number;
    };
  };
}

export interface ExportOptions {
  format: 'coco' | 'csv' | 'yolo' | 'pascal-voc' | 'json';
  includeMetadata?: boolean;
  imageWidth: number;
  imageHeight: number;
  imageName: string;
  categories?: Array<{ id: number; name: string }>;
}

export class AnnotationExportService {
  /**
   * Convert MongoDB annotations to frontend format for export
   */
  convertFromMongo(
    mongoAnnotations: MongoAnnotation[],
    labels: MongoLabel[]
  ): FrontendAnnotation[] {
    return mongoAnnotations.map(ann => {
      try {
        const label = labels.find(l => l._id === ann.labelId);
        const shapeType = ann.shapeData.type;
        
        const frontendAnn: FrontendAnnotation = {
          id: ann._id.toString(),
          type: shapeType,
          properties: {
            label: label?.name,
            style: {
              color: label?.colour || '#13ba83',
              strokeWidth: 2
            }
          }
        };

        // Parse coordinates based on shape type
        const coords = ann.shapeData.coordinates;

        if (shapeType === 'rectangle') {
          // Rectangle: [[x, y], [width, height]] or [x, y, width, height]
          if (Array.isArray(coords[0])) {
            const [[x, y], [w, h]] = coords as number[][];
            frontendAnn.properties.position = { x, y };
            frontendAnn.properties.width = w;
            frontendAnn.properties.height = h;
          } else {
            const [x, y, w, h] = coords as number[];
            frontendAnn.properties.position = { x, y };
            frontendAnn.properties.width = w;
            frontendAnn.properties.height = h;
          }
        } else if (shapeType === 'polygon' || shapeType === 'line') {
          // Polygon/Line: [[x1, y1], [x2, y2], ...]
          frontendAnn.properties.points = (coords as number[][]).map(([x, y]) => ({ x, y }));
        } else if (shapeType === 'point') {
          // Point: [x, y]
          const [x, y] = coords as number[];
          frontendAnn.properties.position = { x, y };
        } else if (shapeType === 'circle') {
          // Circle: [centerX, centerY, radius]
          const [x, y, radius] = coords as number[];
          frontendAnn.properties.position = { x: x - radius, y: y - radius };
          frontendAnn.properties.width = radius * 2;
          frontendAnn.properties.height = radius * 2;
        }

        return frontendAnn;
      } catch (error) {
        console.error(`Failed to parse annotation ${ann._id}:`, error);
        return {
          id: ann._id.toString(),
          type: 'point',
          properties: {
            position: { x: 0, y: 0 },
            label: 'error',
            style: { color: '#ff0000', strokeWidth: 2 }
          }
        };
      }
    });
  }

  /**
   * Export annotations to COCO format (Common for ML training)
   */
  exportCOCO(
    mongoAnnotations: MongoAnnotation[],
    labels: MongoLabel[],
    imageInfo: { id: number; filename: string; width: number; height: number }
  ): string {
    const annotations = this.convertFromMongo(mongoAnnotations, labels);
    
    const cocoFormat = {
      info: {
        description: "Annotation Export",
        version: "1.0",
        year: new Date().getFullYear(),
        date_created: new Date().toISOString()
      },
      images: [
        {
          id: imageInfo.id,
          file_name: imageInfo.filename,
          width: imageInfo.width,
          height: imageInfo.height
        }
      ],
      annotations: annotations
        .map((ann, idx) => {
          const cocoAnn: any = {
            id: idx + 1,
            image_id: imageInfo.id,
            category_id: labels.findIndex(l => l.name === ann.properties.label) + 1 || 1,
            iscrowd: 0
          };

          if ((ann.type === 'rectangle' || ann.type === 'circle') && ann.properties.position) {
            cocoAnn.bbox = [
              ann.properties.position.x,
              ann.properties.position.y,
              ann.properties.width || 0,
              ann.properties.height || 0
            ];
            cocoAnn.area = (ann.properties.width || 0) * (ann.properties.height || 0);
            cocoAnn.segmentation = [];
          } else if ((ann.type === 'polygon' || ann.type === 'line') && ann.properties.points) {
            const flatPoints = ann.properties.points.flatMap(p => [p.x, p.y]);
            cocoAnn.segmentation = [flatPoints];
            
            const xs = ann.properties.points.map(p => p.x);
            const ys = ann.properties.points.map(p => p.y);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);
            
            cocoAnn.bbox = [minX, minY, maxX - minX, maxY - minY];
            cocoAnn.area = (maxX - minX) * (maxY - minY);
          } else {
            return null;
          }

          return cocoAnn;
        })
        .filter(Boolean),
      categories: labels.map((label, idx) => ({
        id: idx + 1,
        name: label.name,
        supercategory: "none"
      }))
    };

    return JSON.stringify(cocoFormat, null, 2);
  }

  /**
   * Export annotations to CSV format
   */
  exportCSV(
    mongoAnnotations: MongoAnnotation[],
    labels: MongoLabel[],
    options: ExportOptions
  ): string {
    const annotations = this.convertFromMongo(mongoAnnotations, labels);
    const headers = ['annotation_id', 'image_name', 'type', 'label', 'x', 'y', 'width', 'height', 'points'];
    const rows = [headers.join(',')];

    annotations.forEach(ann => {
      const row: any[] = [
        ann.id,
        options.imageName,
        ann.type,
        ann.properties.label || ''
      ];

      if ((ann.type === 'rectangle' || ann.type === 'circle') && ann.properties.position) {
        row.push(
          ann.properties.position.x,
          ann.properties.position.y,
          ann.properties.width || 0,
          ann.properties.height || 0,
          ''
        );
      } else if ((ann.type === 'polygon' || ann.type === 'line') && ann.properties.points) {
        const xs = ann.properties.points.map(p => p.x);
        const ys = ann.properties.points.map(p => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        
        row.push(
          minX,
          minY,
          maxX - minX,
          maxY - minY,
          `"${JSON.stringify(ann.properties.points).replace(/"/g, '""')}"`
        );
      } else if (ann.type === 'point' && ann.properties.position) {
        row.push(
          ann.properties.position.x,
          ann.properties.position.y,
          0,
          0,
          ''
        );
      } else {
        row.push('', '', '', '', '');
      }

      rows.push(row.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(','));
    });

    return rows.join('\n');
  }

  /**
   * Export annotations to YOLO format
   */
  exportYOLO(
    mongoAnnotations: MongoAnnotation[],
    labels: MongoLabel[],
    options: ExportOptions
  ): string {
    const annotations = this.convertFromMongo(mongoAnnotations, labels);
    const { imageWidth, imageHeight } = options;
    const lines: string[] = [];

    annotations.forEach(ann => {
      if ((ann.type === 'rectangle' || ann.type === 'circle') && ann.properties.position) {
        const x = ann.properties.position.x;
        const y = ann.properties.position.y;
        const w = ann.properties.width || 0;
        const h = ann.properties.height || 0;

        const xCenter = (x + w / 2) / imageWidth;
        const yCenter = (y + h / 2) / imageHeight;
        const normWidth = w / imageWidth;
        const normHeight = h / imageHeight;

        const classId = labels.findIndex(l => l.name === ann.properties.label);
        const finalClassId = classId >= 0 ? classId : 0;
        
        lines.push(`${finalClassId} ${xCenter.toFixed(6)} ${yCenter.toFixed(6)} ${normWidth.toFixed(6)} ${normHeight.toFixed(6)}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Export annotations to Pascal VOC XML format
   */
  exportPascalVOC(
    mongoAnnotations: MongoAnnotation[],
    labels: MongoLabel[],
    options: ExportOptions
  ): string {
    const annotations = this.convertFromMongo(mongoAnnotations, labels);
    const { imageName, imageWidth, imageHeight } = options;

    const objects = annotations
      .filter(ann => (ann.type === 'rectangle' || ann.type === 'circle') && ann.properties.position)
      .map(ann => {
        const x = ann.properties.position!.x;
        const y = ann.properties.position!.y;
        const w = ann.properties.width || 0;
        const h = ann.properties.height || 0;

        return `
    <object>
      <name>${ann.properties.label || 'object'}</name>
      <pose>Unspecified</pose>
      <truncated>0</truncated>
      <difficult>0</difficult>
      <bndbox>
        <xmin>${Math.round(x)}</xmin>
        <ymin>${Math.round(y)}</ymin>
        <xmax>${Math.round(x + w)}</xmax>
        <ymax>${Math.round(y + h)}</ymax>
      </bndbox>
    </object>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<annotation>
  <folder>images</folder>
  <filename>${imageName}</filename>
  <size>
    <width>${imageWidth}</width>
    <height>${imageHeight}</height>
    <depth>3</depth>
  </size>
  <segmented>0</segmented>${objects}
</annotation>`;
  }

  /**
   * Export annotations to simple JSON format
   */
  exportJSON(
    mongoAnnotations: MongoAnnotation[],
    labels: MongoLabel[],
    options: ExportOptions
  ): string {
    const annotations = this.convertFromMongo(mongoAnnotations, labels);
    
    const exportData = {
      metadata: {
        imageName: options.imageName,
        imageWidth: options.imageWidth,
        imageHeight: options.imageHeight,
        exportDate: new Date().toISOString(),
        annotationCount: annotations.length
      },
      labels: labels.map(l => ({
        id: l._id,
        name: l.name,
        color: l.colour
      })),
      annotations: annotations.map(ann => ({
        id: ann.id,
        type: ann.type,
        label: ann.properties.label,
        properties: ann.properties,
        boundingBox: this.calculateBoundingBox(ann)
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Calculate bounding box for any annotation type
   */
  private calculateBoundingBox(ann: FrontendAnnotation): { x: number; y: number; width: number; height: number } | null {
    if ((ann.type === 'rectangle' || ann.type === 'circle') && ann.properties.position) {
      return {
        x: ann.properties.position.x,
        y: ann.properties.position.y,
        width: ann.properties.width || 0,
        height: ann.properties.height || 0
      };
    }

    if ((ann.type === 'polygon' || ann.type === 'line') && ann.properties.points) {
      const xs = ann.properties.points.map(p => p.x);
      const ys = ann.properties.points.map(p => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    }

    if (ann.type === 'point' && ann.properties.position) {
      return {
        x: ann.properties.position.x,
        y: ann.properties.position.y,
        width: 0,
        height: 0
      };
    }

    return null;
  }

  /**
   * Download exported data as file
   */
  downloadExport(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get file extension for format
   */
  getFileExtension(format: string): string {
    switch (format.toLowerCase()) {
      case 'json':
      case 'coco':
        return 'json';
      case 'csv':
        return 'csv';
      case 'yolo':
        return 'txt';
      case 'pascal-voc':
      case 'pascal voc':
        return 'xml';
      default:
        return 'json';
    }
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format: string): string {
    switch (format.toLowerCase()) {
      case 'json':
      case 'coco':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'yolo':
        return 'text/plain';
      case 'pascal-voc':
      case 'pascal voc':
        return 'application/xml';
      default:
        return 'text/plain';
    }
  }
}