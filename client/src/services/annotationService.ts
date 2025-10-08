export interface ShapeData {
  type: 'rectangle' | 'polygon' | 'line' | 'point' | 'path' | 'brush' | 'text';
  coordinates: any;
  isNormalised: boolean;
}

export interface AnnotationData {
  imageId: string;
  labelId: string;
  createdBy: string;
  shapeData: ShapeData;
}

export interface Annotation {
  _id: string;
  imageId: string;
  labelId: {
    _id: string;
    name: string;
    colour: string;
  };
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  shapeData: ShapeData;
  area?: number;
  createdAt: string;
  updatedAt: string;
}

class AnnotationService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Create a new annotation
   */
  async createAnnotation(annotationData: AnnotationData): Promise<Annotation> {
    try {
      console.log('Creating annotation:', annotationData);
      
      const response = await fetch(`${this.apiBaseUrl}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Annotation created:', data.annotation);
      return data.annotation;
    } catch (error) {
      console.error('Error creating annotation:', error);
      throw error;
    }
  }

  /**
   * Get all annotations for an image
   */
  async getAnnotationsForImage(imageId: string): Promise<Annotation[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/annotations/image/${imageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.annotations;
    } catch (error) {
      console.error('Error fetching annotations:', error);
      throw error;
    }
  }

  /**
   * Update an annotation
   */
  async updateAnnotation(
    annotationId: string, 
    updates: { shapeData?: ShapeData; labelId?: string }
  ): Promise<Annotation> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/annotations/${annotationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.annotation;
    } catch (error) {
      console.error('Error updating annotation:', error);
      throw error;
    }
  }

  /**
   * Delete an annotation
   */
  async deleteAnnotation(annotationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/annotations/${annotationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log('Annotation deleted successfully');
    } catch (error) {
      console.error('Error deleting annotation:', error);
      throw error;
    }
  }
}

export const annotationService = new AnnotationService();