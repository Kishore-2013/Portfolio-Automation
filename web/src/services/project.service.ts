import apiClient from '@/lib/api-client';
import { 
  TemplateDTO, 
  ProjectDTO, 
  FileTreeResponse, 
  FileContentResponse, 
  SaveFileResponse,
  VfsResponse
} from '@/shared/types';
import { CreateProjectInput } from '@/shared/validation';

export const projectService = {
  /**
   * List all available templates
   */
  getTemplates: async (): Promise<TemplateDTO[]> => {
    const response = await apiClient.get<TemplateDTO[]>('/projects/templates');
    return response.data;
  },

  /**
   * List user's projects
   */
  getProjects: async (): Promise<ProjectDTO[]> => {
    const response = await apiClient.get<ProjectDTO[]>('/projects');
    return response.data;
  },

  /**
   * Create a new project from a template
   */
  createProject: async (data: CreateProjectInput): Promise<ProjectDTO> => {
    const response = await apiClient.post<ProjectDTO>('/projects/create', data);
    return response.data;
  },

  /**
   * Get file tree for a project
   */
  getFileTree: async (projectId: number): Promise<FileTreeResponse> => {
    const response = await apiClient.get<FileTreeResponse>(`/projects/${projectId}/files`);
    return response.data;
  },

  /**
   * Get content of a specific file
   */
  getFileContent: async (projectId: number, filePath: string): Promise<FileContentResponse> => {
    const response = await apiClient.get<FileContentResponse>(`/projects/${projectId}/files/${filePath}`);
    return response.data;
  },

  /**
   * Get full VFS (all files) in one request - optimized with Redis
   */
  getFullVFS: async (projectId: number): Promise<VfsResponse> => {
    const response = await apiClient.get<VfsResponse>(`/projects/${projectId}/full-vfs`);
    return response.data;
  },

  /**
   * Save content of a specific file
   */
  saveFileContent: async (projectId: number, filePath: string, content: string): Promise<SaveFileResponse> => {
    const response = await apiClient.put<SaveFileResponse>(`/projects/${projectId}/files/${filePath}`, { content });
    return response.data;
  },

  /**
   * List snapshots for a project
   */
  listSnapshots: async (projectId: number) => {
    const response = await apiClient.get(`/projects/${projectId}/snapshots`);
    return response.data;
  },

  /**
   * Create a manual snapshot
   */
  createSnapshot: async (projectId: number, label?: string) => {
    const response = await apiClient.post(`/projects/${projectId}/snapshots`, { label });
    return response.data;
  },

  /**
   * Restore a snapshot
   */
  restoreSnapshot: async (projectId: number, snapshotId: number) => {
    const response = await apiClient.post(`/projects/${projectId}/snapshots/${snapshotId}/restore`);
    return response.data;
  },
  
  /**
   * Delete a project
   */
  deleteProject: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`);
  },

  /**
   * Check system storage status
   */
  getStorageStatus: async (): Promise<{ free: number; total: number; used: number; path: string; isFull: boolean } | null> => {
    try {
      const response = await apiClient.get('/projects/health/storage');
      return response.data;
    } catch (err) {
      return null;
    }
  },
  /**
   * Get the disk path of a project (only for local development/integration)
   */
  getDiskPath: async (projectId: number): Promise<string> => {
    const response = await apiClient.get<{ diskPath: string }>(`/projects/${projectId}/disk-path`);
    return response.data.diskPath;
  },
};

