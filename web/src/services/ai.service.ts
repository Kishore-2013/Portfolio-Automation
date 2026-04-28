import apiClient from '@/lib/api-client';

export const aiService = {
  /**
   * Merges parsedResume data into the current portfolio data template via server1 AI.
   * @param currentData - The current portfolioData JSON from the template
   * @param resumeData  - The parsed resume data stored in the fileStore
   * @returns The updated portfolioData JSON matching the template schema
   */
  mergeResumeIntoPortfolioData: async (
    currentData: Record<string, any>,
    resumeData: Record<string, any>
  ): Promise<Record<string, any>> => {
    const response = await apiClient.post<{ updatedData: Record<string, any> }>(
      '/ai/merge-resume',
      { currentData, resumeData }
    );
    return (response.data as any).updatedData;
  },
};

