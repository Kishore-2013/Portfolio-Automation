export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  title: string;
  summary?: string;
  skills: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  tech: string[];
  url?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  year: string;
}
