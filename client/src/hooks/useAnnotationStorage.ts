import { useState, useCallback } from 'react';
import { MongoAnnotation } from '../services/annotationExportService';

// Your frontend annotation type (matches your types.ts)
interface FrontendAnnotation {
  id: string;
  type: 'rectangle' | 'polygon' | 'line' | 'text' | 'brush' | 'path' | 'point';
  properties: {
    position?: { x: number; y: number };
    width?: number;
    height?: number;
    points?: Array<{ x: number; y: number }>;
    text?: string;
    label?: string;
    className?: string;
    x?: number;
    y?: number;
    color?: string;
    style?: {
      color?: string;
      strokeWidth?: number;
      fontSize?: number;
      fontFamily?: string;
    };
  };
}

interface UseAnnotationStorageOptions {
  imageId: string;
  projectId: string;
  userId: string;
  apiBaseUrl?: string;
}

export function useAnnotationStorage(options: UseAnnotationStorageOptions) {
  const { imageId, projectId, userId, apiBaseUrl = '/api' } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert frontend annotation to MongoDB format
  const toMongoFormat = useCallback((
    annotation: FrontendAnnotation,
    labelId: string
  ): Omit<MongoAnnotation, '_id' | 'createdAt' | 'updatedAt'> => {
    let coordinates: number[][] | number[];

    if (annotation.type === 'rectangle' && annotation.properties.position) {
      coordinates = [
        [annotation.properties.position.x, annotation.properties.position.y],
        [annotation.properties.width || 0, annotation.properties.height || 0]
      ];
    } else if (annotation.type === 'polygon' || annotation.type === 'line' || annotation.type === 'path' || annotation.type === 'brush') {
      coordinates = (annotation.properties.points || []).map(p => [p.x, p.y]);
    } else if (annotation.type === 'point' && annotation.properties.position) {
      coordinates = [annotation.properties.position.x, annotation.properties.position.y];
    } else if (annotation.type === 'text' && annotation.properties.position) {
      coordinates = [annotation.properties.position.x, annotation.properties.position.y];
    } else {
      coordinates = [];
    }

    // Map type to MongoDB schema types
    let mongoType: 'rectangle' | 'polygon' | 'line' | 'point' | 'circle' = 'point';
    if (annotation.type === 'rectangle') mongoType = 'rectangle';
    else if (annotation.type === 'polygon' || annotation.type === 'brush') mongoType = 'polygon';
    else if (annotation.type === 'line' || annotation.type === 'path') mongoType = 'line';
    else if (annotation.type === 'point' || annotation.type === 'text') mongoType = 'point';

    return {
      imageId,
      labelId,
      createdBy: userId,
      shapeData: {
        type: mongoType,
        coordinates
      }
    };
  }, [imageId, userId]);

  // Save a new annotation to MongoDB
  const saveAnnotation = useCallback(async (
    annotation: FrontendAnnotation,
    labelId: string
  ): Promise<MongoAnnotation | null> => {
    try {
      setIsSaving(true);
      setError(null);

      const mongoAnnotation = toMongoFormat(annotation, labelId);

      const response = await fetch(`${apiBaseUrl}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(mongoAnnotation)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save annotation: ${response.statusText}`);
      }

      const saved = await response.json();
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save annotation';
      setError(errorMessage);
      console.error('Save annotation error:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [apiBaseUrl, toMongoFormat]);

  // Update an existing annotation
  const updateAnnotation = useCallback(async (
    annotationId: string,
    annotation: FrontendAnnotation,
    labelId: string
  ): Promise<boolean> => {
    try {
      setIsSaving(true);
      setError(null);

      const mongoAnnotation = toMongoFormat(annotation, labelId);

      const response = await fetch(`${apiBaseUrl}/annotations/${annotationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(mongoAnnotation)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update annotation: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update annotation';
      setError(errorMessage);
      console.error('Update annotation error:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [apiBaseUrl, toMongoFormat]);

  // Delete an annotation
  const deleteAnnotation = useCallback(async (annotationId: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/annotations/${annotationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete annotation: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete annotation';
      setError(errorMessage);
      console.error('Delete annotation error:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [apiBaseUrl]);

  // Load annotations for an image
  const loadAnnotations = useCallback(async (): Promise<MongoAnnotation[]> => {
    try {
      setError(null);

      const response = await fetch(`${apiBaseUrl}/annotations?imageId=${imageId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load annotations: ${response.statusText}`);
      }

      const annotations = await response.json();
      return annotations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load annotations';
      setError(errorMessage);
      console.error('Load annotations error:', err);
      return [];
    }
  }, [apiBaseUrl, imageId]);

  // Batch save multiple annotations
  const batchSaveAnnotations = useCallback(async (
    annotations: Array<{ annotation: FrontendAnnotation; labelId: string }>
  ): Promise<MongoAnnotation[]> => {
    try {
      setIsSaving(true);
      setError(null);

      const mongoAnnotations = annotations.map(({ annotation, labelId }) =>
        toMongoFormat(annotation, labelId)
      );

      const response = await fetch(`${apiBaseUrl}/annotations/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ annotations: mongoAnnotations })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to batch save annotations: ${response.statusText}`);
      }

      const saved = await response.json();
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to batch save annotations';
      setError(errorMessage);
      console.error('Batch save error:', err);
      return [];
    } finally {
      setIsSaving(false);
    }
  }, [apiBaseUrl, toMongoFormat]);

  return {
    saveAnnotation,
    updateAnnotation,
    deleteAnnotation,
    loadAnnotations,
    batchSaveAnnotations,
    isSaving,
    error,
    clearError: () => setError(null)
  };
}