import apiClient from '@/lib/api-client';
import { TemplateDTO } from '@/shared/types';

export const templateService = {
  /**
   * Verify admin key
   */
  verifyKey: async (adminKey: string): Promise<boolean> => {
    try {
      await apiClient.post('/admin/verify', {}, {
        headers: { 'x-admin-key': adminKey }
      });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Upload a new template (Admin)
   */
  uploadTemplate: async (formData: FormData, adminKey?: string): Promise<{ template: TemplateDTO }> => {
    const headers: Record<string, string> = {};
    if (adminKey) {
      headers['x-admin-key'] = adminKey;
    }

    const response = await apiClient.post<{ template: TemplateDTO }>(
      '/admin/templates/upload',
      formData,
      {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete a template (Admin)
   */
  deleteTemplate: async (id: string, adminKey: string): Promise<void> => {
    await apiClient.delete(`/admin/templates/${id}`, {
      headers: {
        'x-admin-key': adminKey,
      },
    });
  },
};

