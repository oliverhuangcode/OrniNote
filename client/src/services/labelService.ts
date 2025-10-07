import { getAuthHeaders, handleAuthError } from '../utils/apiHelper';

export interface Label {
  _id: string;
  name: string;
  colour: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

class LabelService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getLabelsForProject(projectId: string): Promise<Label[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/labels/project/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders(), // UPDATED
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.labels;
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw error;
    }
  }

  async createLabel(labelData: { name: string; colour: string; projectId: string }): Promise<Label> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/labels`, {
        method: 'POST',
        headers: getAuthHeaders(), // UPDATED
        body: JSON.stringify(labelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.label;
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  }

  async updateLabel(labelId: string, updates: { name?: string; colour?: string }): Promise<Label> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/labels/${labelId}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // UPDATED
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.label;
    } catch (error) {
      console.error('Error updating label:', error);
      throw error;
    }
  }

  async deleteLabel(labelId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/labels/${labelId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(), // UPDATED
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log('Label deleted successfully');
    } catch (error) {
      console.error('Error deleting label:', error);
      throw error;
    }
  }
}

export const labelService = new LabelService();