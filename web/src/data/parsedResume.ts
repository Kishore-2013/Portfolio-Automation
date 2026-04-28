export interface ParsedResume {
    name: string;
    role: string;
    bio: string;
    skills: string[];
    projects: {
        title: string;
        description: string;
    }[];
    socialLinks: {
        github: string;
        linkedin: string;
        twitter?: string;
    };
}

export const mockParsedResume: ParsedResume = {
    name: "Alex Chen",
    role: "Frontend Developer",
    bio: "Passionate React developer with 5+ years of experience building scalable web applications.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind", "Zustand", "Framer Motion"],
    projects: [
        {
            title: "AI Resume Builder",
            description: "Built an AI powered resume generator using GPT-4 and Next.js."
        },
        {
            title: "Portfolio Generator",
            description: "A tool that generates professional portfolio sites from raw resume data."
        },
        {
            title: "E-commerce Dashboard",
            description: "Real-time analytics dashboard for high-volume e-commerce platforms."
        }
    ],
    socialLinks: {
        github: "github.com/alexchen",
        linkedin: "linkedin.com/alexchen",
        twitter: "twitter.com/alexchen_dev"
    }
};

