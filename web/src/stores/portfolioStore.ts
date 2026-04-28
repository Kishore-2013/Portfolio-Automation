import { create } from 'zustand';
import { IPortfolioData } from '@/shared/types';
import { mapResumeToPortfolio } from '@/lib/templateMapper';

interface PortfolioStore {
  portfolioData: IPortfolioData | null;
  setPortfolioData: (data: IPortfolioData) => void;
  updateFromParsedResume: (parsedData: any) => void;
  reset: () => void;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  portfolioData: null,
  setPortfolioData: (data) => set({ portfolioData: data }),
  updateFromParsedResume: (parsedData) => {
    console.log('[PortfolioStore] 🔄 Updating from parsed resume:', parsedData);
    const normalizedData = mapResumeToPortfolio(parsedData);
    set({ portfolioData: normalizedData });
  },
  reset: () => set({ portfolioData: null }),
}));
