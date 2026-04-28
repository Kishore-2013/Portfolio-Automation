import { Eye, Clock, MousePointer2, AppWindow } from "lucide-react"

export const dashboardStats = [
    { title: "Total Views", value: "1,335", icon: Eye, trend: "12%", trendType: "up" as const },
    { title: "Avg. Session", value: "2m 45s", icon: Clock, trend: "5%", trendType: "up" as const },
    { title: "Conv. Rate", value: "3.2%", icon: MousePointer2, trend: "0.5%", trendType: "up" as const },
    { title: "Templates", value: "3/12", icon: AppWindow },
]

export const recentPortfolios = [
    {
        title: "Senior Frontend Lead 2024",
        template: "Hyperdrive",
        status: "Live" as const,
        lastEdited: "2 days ago",
        views: 432,
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2344&auto=format&fit=crop"
    },
    {
        title: "Fullstack Architecture",
        template: "Minimalist Mono",
        status: "Draft" as const,
        lastEdited: "1 week ago",
        views: 12,
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2340&auto=format&fit=crop"
    },
    {
        title: "Open Source Contributor",
        template: "Glassmorphism Pro",
        status: "Live" as const,
        lastEdited: "3 weeks ago",
        views: 891,
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2340&auto=format&fit=crop"
    }
]

export const generationStatistics = {
    totalPortfolios: 12,
    successfulGenerations: 10,
    failedGenerations: 2,
    thisMonth: 4
}

export const activityFeed = [
    {
        id: "act-1",
        type: "generation",
        title: "New Portfolio Generated",
        description: "Your portfolio using 'Neo-Brutalist' template is ready.",
        timestamp: "2 hours ago"
    },
    {
        id: "act-2",
        type: "update",
        title: "Profile Updated",
        description: "You updated your professional summary.",
        timestamp: "5 hours ago"
    },
    {
        id: "act-3",
        type: "view",
        title: "Portfolio View",
        description: "Someone from San Francisco viewed your portfolio.",
        timestamp: "1 day ago"
    }
]

export const tipOfTheWeek = {
    badge: "Strategy of the Week",
    title: "Consistency defines the Top 1% of developers.",
    highlight: "Top 1%",
    description: "Syncing your GitHub brand colors with your portfolio creates an instant \"trust-factor\" for hiring managers.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
}

