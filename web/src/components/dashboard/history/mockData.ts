export interface Project {
    id: string
    title: string
    template: string
    status: "Published" | "Draft"
    lastModified: string
    imageUrl: string
}

export const MOCK_PROJECTS: Project[] = [
    {
        id: "1",
        title: "Full Stack Portfolio 2024",
        template: "Modern Dark",
        status: "Published",
        lastModified: "Oct 24, 2023",
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop"
    },
    {
        id: "2",
        title: "Frontend Specialist v2",
        template: "Minimalist Light",
        status: "Draft",
        lastModified: "Nov 12, 2023",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop"
    },
    {
        id: "3",
        title: "Data Science Resume Site",
        template: "Terminal Pro",
        status: "Published",
        lastModified: "Dec 05, 2023",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"
    },
    {
        id: "4",
        title: "Alex Dev - Mobile Portfolio",
        template: "Neo Brutalist",
        status: "Draft",
        lastModified: "Jan 18, 2024",
        imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop"
    },
    {
        id: "5",
        title: "Cyber Security Landing",
        template: "Matrix Stealth",
        status: "Published",
        lastModified: "Feb 02, 2024",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop"
    },
    {
        id: "6",
        title: "Classic Bio Page",
        template: "Clean Slate",
        status: "Draft",
        lastModified: "Mar 10, 2024",
        imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop"
    }
]

