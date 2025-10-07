import { getAuthHeaders, handleAuthError } from '../utils/apiHelper';

export interface ProjectData {
  name: string;
  description?: string;
  imageUrl: string;
  imageFilename: string; 
  imageWidth: number;
  imageHeight: number;
  ownerId: string; 
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
  collaborators: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: string;
    addedAt: string;
  }>;
  images: Array<{
    _id: string;
    filename: string;
    url: string;
    width: number;
    height: number;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateProjectResponse {
  message: string;
  project: Project;
}

export interface GetProjectsResponse {
  projects: Project[];
}

class ProjectService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api') {
    this.apiBaseUrl = apiBaseUrl;
    console.log('ProjectService initialized with API base URL:', this.apiBaseUrl);
  }

  /**
   * Create a new project with image upload
   */
  async createProject(projectData: ProjectData): Promise<Project> {
    try {
      console.log('ProjectService: Creating project with data:', projectData);
      
      const response = await fetch(`${this.apiBaseUrl}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(), // UPDATED
        body: JSON.stringify(projectData),
      });

      console.log('Create project response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create project error response:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreateProjectResponse = await response.json();
      console.log('Project created successfully:', data.project);
      return data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    try {
      console.log('ProjectService: Fetching projects for user:', userId);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/user/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(), // UPDATED
      });

      console.log('Get user projects response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Get user projects error response:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GetProjectsResponse = await response.json();
      console.log(`Found ${data.projects.length} projects for user ${userId}`);
      return data.projects;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  }

  /**
   * Get deleted projects for a user
   */
  async getDeletedProjects(userId: string): Promise<Project[]> {
    try {
      console.log('ProjectService: Fetching deleted projects for user:', userId);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/user/${userId}?includeDeleted=true`, {
        method: 'GET',
        headers: getAuthHeaders(), // UPDATED
      });

      console.log('Get deleted projects response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Get deleted projects error response:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GetProjectsResponse = await response.json();
      console.log(`Found ${data.projects.length} deleted projects for user ${userId}`);
      return data.projects;
    } catch (error) {
      console.error('Error fetching deleted projects:', error);
      throw error;
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    try {
      console.log('ProjectService: Fetching project:', projectId);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}`, {
        method: 'GET',
        headers: getAuthHeaders(), // UPDATED
      });

      console.log('Get project response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Get project error response:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Project fetched successfully:', data.project);
      return data.project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Update project details
   */
  async updateProject(projectId: string, updates: { name?: string; description?: string }): Promise<Project> {
    try {
      console.log('ProjectService: Updating project:', projectId, updates);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // UPDATED
        body: JSON.stringify(updates),
      });

      console.log('Update project response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update project error response:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Project updated successfully:', data.project);
      return data.project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete a project (soft delete)
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      console.log('ProjectService: Deleting project', projectId);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(), // UPDATED
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete response error:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Project deleted successfully:', result);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Restore a deleted project
   */
  async restoreProject(projectId: string): Promise<void> {
    try {
      console.log('ProjectService: Restoring project', projectId);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/restore`, {
        method: 'PUT',
        headers: getAuthHeaders(), // UPDATED
      });

      console.log('Restore response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Restore response error:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Project restored successfully');
    } catch (error) {
      console.error('Error restoring project:', error);
      throw error;
    }
  }

  /**
   * Permanently delete a project
   */
  async permanentlyDeleteProject(projectId: string): Promise<void> {
    try {
      console.log('ProjectService: Permanently deleting project', projectId);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/permanent`, {
        method: 'DELETE',
        headers: getAuthHeaders(), // UPDATED
      });

      console.log('Permanent delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Permanent delete response error:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Project permanently deleted successfully');
    } catch (error) {
      console.error('Error permanently deleting project:', error);
      throw error;
    }
  }

  /**
   * Add image to existing project
   */
  async addImageToProject(
    projectId: string, 
    imageData: {
      imageUrl: string;
      imageFilename: string;
      imageWidth: number;
      imageHeight: number;
    }
  ): Promise<Project> {
    try {
      console.log('ProjectService: Adding image to project', projectId, imageData);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/images`, {
        method: 'POST',
        headers: getAuthHeaders(), // UPDATED
        body: JSON.stringify(imageData),
      });

      console.log('Add image response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Add image error response:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Image added successfully:', data.image);
      return data.project;
    } catch (error) {
      console.error('Error adding image to project:', error);
      throw error;
    }
  }

  /**
   * Batch add multiple images to existing project
   */
  async batchAddImagesToProject(
    projectId: string,
    imagesData: Array<{
      imageUrl: string;
      imageFilename: string;
      imageWidth: number;
      imageHeight: number;
    }>
  ): Promise<Project> {
    try {
      console.log('ProjectService: Batch adding images to project', projectId, imagesData.length);
      
      const response = await fetch(`${this.apiBaseUrl}/projects/${projectId}/images/batch`, {
        method: 'POST',
        headers: getAuthHeaders(), // UPDATED
        body: JSON.stringify({ images: imagesData }),
      });

      console.log('Batch add images response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Batch add images error response:', errorData);
        if (response.status === 401) handleAuthError(response); // ADDED
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Images batch added successfully:', data.addedImages.length);
      return data.project;
    } catch (error) {
      console.error('Error batch adding images to project:', error);
      throw error;
    }
  }


  /**
   * Convert backend project format to dashboard card format
   */
  convertToCardFormat(project: Project): {
    id: string;
    name: string;
    lastEdited: string;
    thumbnail: string;
    collaborators?: { initial: string; color: string }[];
    deletedAt?: string | null;
  } {
    // Get the first image as thumbnail
    const thumbnail = project.images.length > 0 
      ? project.images[0].url 
      : 'https://via.placeholder.com/656x400?text=No+Image';

    // Create collaborator avatars
    const collaborators = project.collaborators
      .filter(collab => collab.user._id !== project.owner._id) // Exclude owner
      .slice(0, 3) // Limit to 3 collaborators
      .map((collab, index) => ({
        initial: collab.user.username.charAt(0).toUpperCase(),
        color: this.getCollaboratorColor(index)  // CHANGED: Use getCollaboratorColor instead
      }));

    // Format last edited time
    const lastEdited = this.formatLastEdited(project.updatedAt);

    return {
      id: project._id,
      name: project.name,
      lastEdited,
      thumbnail,
      collaborators: collaborators.length > 0 ? collaborators : undefined,
      deletedAt: project.deletedAt || null
    };
  }

  /**
   * Get a color for collaborator avatars
   */
  private getCollaboratorColor(index: number): string {
    const colors = [
      '#E96DDF', '#5BABE9', '#F39A4D', 
      '#FF6B6B', '#4ECDC4', '#45B7D1',
      '#96CEB4', '#FFEAA7', '#DDA0DD'
    ];
    return colors[index % colors.length];
  }

  /**
   * Format the last edited timestamp
   */
  private formatLastEdited(updatedAt: string): string {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Edited just now';
    if (diffInMinutes < 60) return `Edited ${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Edited ${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Edited ${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `Edited ${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
}

// Export singleton instance
export const projectService = new ProjectService();