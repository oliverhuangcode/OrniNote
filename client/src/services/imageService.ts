import { getAuthHeaders, handleAuthError } from '../utils/apiHelper';

export interface Image {
  _id: string;
  filename: string;
  projectId: string;
}

class ImageService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getImagesByProject(projectId: string): Promise<Image[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/images`, { 
        method: 'GET',
        headers: getAuthHeaders(), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) handleAuthError(response);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.images;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  }

  async getImage(imageId: string) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/images/${imageId}`, { 
        method: 'GET',
        headers: getAuthHeaders(), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) handleAuthError(response);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  }
}

export const imageService = new ImageService();