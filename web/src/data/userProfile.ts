export interface UserProfile {
    name: string
    email: string
    avatar: string
    joinedDate: string
    totalPortfolios: number
    title: string
    location: string
    bio: string
    socialLinks: {
        github?: string
        linkedin?: string
        twitter?: string
        portfolio?: string
    }
}

export const userProfile: UserProfile = {
    name: "Alex Dev",
    email: "alex.designer@portfolio-tool.io",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    joinedDate: "January 2024",
    totalPortfolios: 12,
    title: "Senior Full Stack Engineer",
    location: "San Francisco, CA",
    bio: "Passionate developer focusing on clean code, automated workflows, and high-performance web applications. I love building tools that empower other creators.",
    socialLinks: {
        github: "https://github.com/alexdev",
        linkedin: "https://linkedin.com/in/alexdev",
        twitter: "https://twitter.com/alexdev"
    }
}

