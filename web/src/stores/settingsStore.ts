import { create } from 'zustand';

interface SettingsState {
  isWorkspaceDialogOpen: boolean;
  openWorkspaceDialog: () => void;
  closeWorkspaceDialog: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isWorkspaceDialogOpen: false,
  openWorkspaceDialog: () => set({ isWorkspaceDialogOpen: true }),
  closeWorkspaceDialog: () => set({ isWorkspaceDialogOpen: false }),
}));

