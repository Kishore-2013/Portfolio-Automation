export interface PortfolioEntry {
    portfolioId: string
    id: string // mapping for component compatibility
    title: string
    portfolioName: string // mapping for requested fields
    templateName: string
    template: string // mapping for component compatibility
    createdAt: string
    lastEdited: string
    lastModified: string // mapping for component compatibility
    status: "Published" | "Draft" | "Live"
    imageUrl: string
}

export const portfolioHistory: PortfolioEntry[] = [
    {
        portfolioId: "1",
        id: "1",
        portfolioName: "Full Stack Portfolio 2024",
        title: "Full Stack Portfolio 2024",
        templateName: "Modern Dark",
        template: "Modern Dark",
        createdAt: "Oct 20, 2023",
        lastEdited: "Oct 24, 2023",
        lastModified: "Oct 24, 2023",
        status: "Published",
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop"
    },
    {
        portfolioId: "2",
        id: "2",
        portfolioName: "Frontend Specialist v2",
        title: "Frontend Specialist v2",
        templateName: "Minimalist Light",
        template: "Minimalist Light",
        createdAt: "Nov 01, 2023",
        lastEdited: "Nov 12, 2023",
        lastModified: "Nov 12, 2023",
        status: "Draft",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop"
    },
    {
        portfolioId: "3",
        id: "3",
        portfolioName: "Data Science Resume Site",
        title: "Data Science Resume Site",
        templateName: "Terminal Pro",
        template: "Terminal Pro",
        createdAt: "Dec 01, 2023",
        lastEdited: "Dec 05, 2023",
        lastModified: "Dec 05, 2023",
        status: "Published",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"
    },
    {
        portfolioId: "4",
        id: "4",
        portfolioName: "Alex Dev - Mobile Portfolio",
        title: "Alex Dev - Mobile Portfolio",
        templateName: "Neo Brutalist",
        template: "Neo Brutalist",
        createdAt: "Jan 10, 2024",
        lastEdited: "Jan 18, 2024",
        lastModified: "Jan 18, 2024",
        status: "Draft",
        imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop"
    },
    {
        portfolioId: "5",
        id: "5",
        portfolioName: "Cyber Security Landing",
        title: "Cyber Security Landing",
        templateName: "Matrix Stealth",
        template: "Matrix Stealth",
        createdAt: "Jan 25, 2024",
        lastEdited: "Feb 02, 2024",
        lastModified: "Feb 02, 2024",
        status: "Published",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop"
    },
    {
        portfolioId: "6",
        id: "6",
        portfolioName: "Classic Bio Page",
        title: "Classic Bio Page",
        templateName: "Clean Slate",
        template: "Clean Slate",
        createdAt: "Mar 01, 2024",
        lastEdited: "Mar 10, 2024",
        lastModified: "Mar 10, 2024",
        status: "Draft",
        imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop"
    }
]

