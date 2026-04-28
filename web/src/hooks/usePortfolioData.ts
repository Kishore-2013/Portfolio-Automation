import { usePortfolioStore } from '@/stores/portfolioStore';
import { IPortfolioData } from '@/shared/types';

/**
 * Hook to access the live portfolio data from the store.
 * Provides a unified way for components to consume dynamic data.
 */
export function usePortfolioData() {
  const portfolioData = usePortfolioStore((state) => state.portfolioData);
  const setPortfolioData = usePortfolioStore((state) => state.setPortfolioData);
  const updateFromParsedResume = usePortfolioStore((state) => state.updateFromParsedResume);

  return {
    portfolioData,
    setPortfolioData,
    updateFromParsedResume,
    hasData: !!portfolioData
  };
}
