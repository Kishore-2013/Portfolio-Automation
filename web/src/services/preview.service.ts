import apiClient from '@/lib/api-client';
import { PreviewStatus, PreviewHealth } from '@/shared/types';

export const previewService = {
  /**
   * Start preview environment — spawns (or reuses) the dev server
   * and returns { previewUrl, kind } once the port is ready.
   */
  startPreview: async (projectId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(`preview/${projectId}/start`);
    return response.data;
  },

  /**
   * Stop preview environment — kills the dev server for this project.
   */
  stopPreview: async (projectId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(`preview/${projectId}/stop`);
    return response.data;
  },

  /**
   * Get preview status — polls isActive + previewUrl + state.
   * Call this in a loop after startPreview to detect when the server is ready.
   */
  getStatus: async (projectId: number): Promise<PreviewStatus> => {
    const response = await apiClient.get<PreviewStatus>(`preview/${projectId}/status`);
    return response.data;
  },

  /**
   * Health-check — lightweight TCP-probe of the running dev server port.
   * Use this for the periodic heartbeat once the preview is already live,
   * to detect silent crashes without restarting polling.
   */
  healthCheck: async (projectId: number): Promise<PreviewHealth> => {
    const response = await apiClient.get<PreviewHealth>(`preview/${projectId}/health`);
    return response.data;
  },
};
