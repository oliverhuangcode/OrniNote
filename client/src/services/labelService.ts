export interface Label {
  _id: string;
  projectId: string;
  name: string;
  colour: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabelData {
  projectId: string;
  name: string;
  colour: string;
}

class LabelService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Create a new label
   */
  async createLabel(labelData: CreateLabelData): Promise<Label> {
    try {
      console.log('Creating label:', labelData);
      
      const response = await fetch(`${this.apiBaseUrl}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(labelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Label created:', data.label);
      return data.label;
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  }

  /**
   * Get all labels for a project
   */
  async getLabelsForProject(projectId: string): Promise<Label[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/labels/project/${projectId}`, {
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
      return data.labels;
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw error;
    }
  }

  /**
   * Update a label
   */
  async updateLabel(labelId: string, updates: { name?: string; colour?: string }): Promise<Label> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/labels/${labelId}`, {
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
      return data.label;
    } catch (error) {
      console.error('Error updating label:', error);
      throw error;
    }
  }

  /**
   * Delete a label
   */
  async deleteLabel(labelId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/labels/${labelId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
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