export interface TemplateDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  techStack: string[];
  domain: string;
  thumbUrl: string | null;
  previews: string[];
  isActive: boolean;
  gitRepoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDTO {
  id: number;
  name: string;
  templateId: string;
  status: 'CREATING' | 'READY' | 'SLEEPING' | 'ERROR';
  // installStatus REMOVED — no longer tracked
  previewUrl: string | null;
  lastSavedAt: Date | null;
  lastOpenedAt: Date | null;
  createdAt: Date;
  // NOTE: diskPath is NEVER included in any DTO — server-only internal detail
}


export interface FileNode {
  name: string;
  path: string;          // relative path from project root e.g. "src/App.jsx"
  type: 'file' | 'dir';
  children?: FileNode[]; // only present when type === 'dir'
}

export interface FileTreeResponse {
  projectId: number;
  tree: FileNode[];
}

export interface FileContentResponse {
  projectId: number;
  filePath: string;
  content: string;
}

export interface SaveFileResponse {
  saved: boolean;
  filePath: string;
}

export interface VfsResponse {
  projectId: number;
  files: Record<string, string>; // path -> content
}

// ─────────────────────────────────────────────────────────────────────────────
// Hybrid Resume Parser Types (matches ParsedData from the parser)
// ─────────────────────────────────────────────────────────────────────────────

export interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
  leetcode: string;
  hackerrank: string;
  portfolio: string;
}

export interface ParsedExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  bullets: string;
}

export interface ParsedEducation {
  id: string;
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

export interface ParsedProject {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  thumbnail?: string;
  imagePrompt?: string; // Internal field for AI image generation
}

export interface ParsedCertification {
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ParsedStat {
  label: string;
  value: string;
}

export interface CustomSection {
  id: string;
  title: string;
  icon?: string;
  items: Array<{
    title: string;
    subtitle?: string;
    description?: string;
    date?: string;
    link?: string;
  }>;
}

export interface ParsedData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  socialLinks: SocialLinks;
  summary: string;
  targetRole?: string;
  skills: string[];
  experiences: ParsedExperience[];
  educations: ParsedEducation[];
  projects: ParsedProject[] | string;
  certifications: ParsedCertification[] | string;
  stats?: ParsedStat[];
  customSections?: CustomSection[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: any[];
}

export type IPortfolioData = ParsedData;


