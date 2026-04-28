import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VirtualFileSystem } from "@/components/builder/fileStore";

export interface Template {
    id: string;
    name: string;
    description: string;
    previewImage: string;
    files?: VirtualFileSystem | Record<string, string>;
    // Optional display metadata
    category?: string;
    tags?: string[];
    previews?: string[];
    badge?: "New" | "Popular";
    gitRepoUrl?: string;
}

interface TemplateStore {
    selectedTemplate: Template | null;
    setSelectedTemplate: (template: Template) => void;
    clearSelectedTemplate: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
    persist(
        (set) => ({
            selectedTemplate: null,
            setSelectedTemplate: (template) => set({ selectedTemplate: template }),
            clearSelectedTemplate: () => set({ selectedTemplate: null }),
        }),
        {
            name: "template-storage",
        }
    )
);

