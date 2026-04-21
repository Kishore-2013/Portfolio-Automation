export interface ExperienceEntry {
    role: string;
    company: string;
    period: string;
    desc: string;
}

export interface EducationEntry {
    degree: string;
    institution: string;
    year: string;
    grade: string;
}


export interface MissingRequired {
    id: string;
    title: string;
    desc: string;
    placeholder: string;
}

export interface OrphanedData {
    id: string;
    title: string;
    content: string;
}

export interface PersonalDetails {
    fullName: string;
    email: string;
    github: string;
    linkedin: string;
    summary: string;
}

export interface ReconciliationData {
    progress: number;
    unresolvedWarnings: number;
    extraSections: number;
    accuracy: string;
    personalDetails: PersonalDetails;
    skills: string[];
    experience: ExperienceEntry[];
    education: EducationEntry[];
    projects: string;
    certifications: string;
    missingRequired: MissingRequired[];
    orphanedData: OrphanedData[];
}


