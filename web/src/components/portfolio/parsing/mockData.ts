import { ReconciliationData } from "./types";

export const MOCK_RECONCILIATION_DATA: ReconciliationData = {
    progress: 85,
    unresolvedWarnings: 12,
    extraSections: 3,
    accuracy: "85% Data Accuracy",
    personalDetails: {
        fullName: "Alex Rivera",
        email: "arivera.dev@gmail.com",
        github: "arivera-dev",
        linkedin: "alex-rivera-tech",
        summary: "Passionate Full Stack Developer with 5+ years of experience building scalable web applications. Expert in React and cloud architecture."
    },
    skills: ["React", "TypeScript", "Node.js", "TailwindCSS", "PostgreSQL", "AWS"],
    experience: [
        {
            role: "Senior Frontend Engineer",
            company: "TechFlow Solutions",
            period: "2021 - Present",
            desc: "Lead the frontend team in migrating a legacy Rails app to Next.js. Reduced bundle sizes by 40% and improved Core Web Vitals across the platform."
        }
    ],
    missingRequired: [
        {
            id: "bio",
            title: "Portfolio Bio",
            desc: "The 'Modern Minimal' template requires a 150-word landing bio.",
            placeholder: "Enter portfolio bio..."
        }
    ],
    orphanedData: [
        {
            id: "vol",
            title: "Volunteer Experience",
            content: "Teaching assistant for Code.org local workshop (2019-2020)."
        }
    ]
}

