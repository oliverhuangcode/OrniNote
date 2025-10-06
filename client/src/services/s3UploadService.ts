// React hook for easier usage
import { useState } from 'react';

// client/src/services/s3UploadService.ts
export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface PreSignedUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  key: string;
}

class S3UploadService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get a pre-signed URL from your Express backend
   */
  async getPreSignedUrl(fileName: string, fileType: string): Promise<PreSignedUrlResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/upload/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          fileType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting pre-signed URL:', error);
      throw error;
    }
  }

  /**
   * Upload file directly to S3 using pre-signed URL
   */
  async uploadToS3(file: File, uploadUrl: string, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status} - ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 300000; // 5 minutes timeout
      xhr.send(file);
    });
  }

  /**
   * Upload multiple images to S3
   */
  async uploadMultipleImages(
    files: File[],
    onProgress?: (fileIndex: number, fileName: string, progress: number) => void
  ): Promise<{ success: boolean; results: UploadResponse[] }> {
    const results: UploadResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.uploadImage(file, (progress) => {
          onProgress?.(i, file.name, progress);
        });
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return {
      success: results.every(r => r.success),
      results
    };
  }

  /**
   * Extract image files from a zip file
   */
  async extractImagesFromZip(zipFile: File): Promise<File[]> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    try {
      const zipContent = await zip.loadAsync(zipFile);
      const imageFiles: File[] = [];
      
      // Iterate through all files in the zip
      for (const [filename, file] of Object.entries(zipContent.files)) {
        // Skip directories and hidden files
        if (file.dir || filename.startsWith('__MACOSX') || filename.startsWith('.')) {
          continue;
        }
        
        // Check if it's an image file
        const extension = filename.split('.').pop()?.toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (extension && imageExtensions.includes(extension)) {
          // Extract the file as a blob
          const blob = await file.async('blob');
          
          // Determine MIME type
          const mimeType = this.getMimeTypeFromExtension(extension);
          
          // Create a File object with just the filename (no path)
          const fileName = filename.split('/').pop() || filename;
          const imageFile = new File([blob], fileName, { type: mimeType });
          
          imageFiles.push(imageFile);
        }
      }
      
      return imageFiles;
    } catch (error) {
      console.error('Error extracting images from zip:', error);
      throw new Error('Failed to extract images from zip file');
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    
    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Complete upload process with progress tracking
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    try {
      // Validate file
      if (!this.isValidImageFile(file)) {
        return {
          success: false,
          error: 'Invalid file type. Please upload an image file.',
        };
      }

      onProgress?.(5);

      // Generate unique filename
      const uniqueFileName = this.generateUniqueFileName(file.name);
      
      onProgress?.(10);

      // Get pre-signed URL from backend
      const { uploadUrl, imageUrl } = await this.getPreSignedUrl(
        uniqueFileName,
        file.type
      );

      onProgress?.(20);

      // Upload to S3 with progress tracking
      await this.uploadToS3(file, uploadUrl, (uploadProgress) => {
        // Map upload progress to 20-100% range
        const totalProgress = 20 + (uploadProgress * 0.8);
        onProgress?.(totalProgress);
      });

      console.log('S3 upload successful:', {
        fileName: file.name,
        size: this.formatFileSize(file.size),
        type: file.type,
        url: imageUrl
      });

      return {
        success: true,
        imageUrl,
      };
    } catch (error) {
      console.error('S3 upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Test backend connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/upload/test`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Connection test failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Backend connection failed' 
      };
    }
  }

  /**
   * Delete image from S3
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(imageUrl);
      if (!key) {
        console.error('Could not extract key from URL:', imageUrl);
        return false;
      }

      const response = await fetch(`${this.apiBaseUrl}/upload/image/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Image deleted:', key);
        return true;
      } else {
        console.error('Failed to delete image:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Validate if file is an image
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    return validTypes.includes(file.type);
  }

  /**
   * Generate unique filename to avoid conflicts
   */
  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop() || 'jpg';
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Extract S3 key from image URL
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      if (url.includes('cloudfront.net/')) {
        return url.split('cloudfront.net/')[1];
      }
      
      if (url.includes('.s3.amazonaws.com/')) {
        return url.split('.s3.amazonaws.com/')[1];
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create singleton instance
export const s3UploadService = new S3UploadService();


export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  imageUrl: string | null;
}

export function useS3Upload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    imageUrl: null,
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      imageUrl: null,
    });

    try {
      const result = await s3UploadService.uploadImage(file, (progress) => {
        setUploadState(prev => ({ ...prev, progress }));
      });

      if (result.success && result.imageUrl) {
        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
          imageUrl: result.imageUrl,
        });
        return result.imageUrl;
      } else {
        setUploadState({
          isUploading: false,
          progress: 0,
          error: result.error || 'Upload failed',
          imageUrl: null,
        });
        return null;
      }
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        imageUrl: null,
      });
      return null;
    }
  };

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      imageUrl: null,
    });
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      const result = await s3UploadService.testConnection();
      if (!result.success) {
        setUploadState(prev => ({ 
          ...prev, 
          error: `Backend connection failed: ${result.message}` 
        }));
      }
      return result.success;
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        error: `Backend connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
      return false;
    }
  };

  return {
    ...uploadState,
    uploadImage,
    resetUpload,
    testConnection,
  };
}