import { VirtualFileSystem } from "@/components/builder/fileStore";

export interface GeneratedPortfolio {
    templateId: string;
    files: VirtualFileSystem;
    generatedAt: string;
}

export const initialGeneratedState: GeneratedPortfolio | null = null;

