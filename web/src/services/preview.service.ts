import apiClient from '@/lib/api-client';
import { PreviewStatus } from '@/shared/types';

export const previewService = {
  /**
   * Start preview environment
   */
  startPreview: async (projectId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(`/preview/${projectId}/start`);
    return response.data;
  },

  /**
   * Stop preview environment
   */
  stopPreview: async (projectId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(`/preview/${projectId}/stop`);
    return response.data;
  },

  /**
   * Get preview status
   */
  getStatus: async (projectId: number): Promise<PreviewStatus> => {
    const response = await apiClient.get<PreviewStatus>(`/preview/${projectId}/status`);
    return response.data;
  },
};

