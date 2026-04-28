import { ProjectHistoryHeader } from "@/components/dashboard/history/ProjectHistoryHeader"
import { ProjectHistoryFilter } from "@/components/dashboard/history/ProjectHistoryFilter"
import { HistoryPortfolioCard } from "@/components/dashboard/history/HistoryPortfolioCard"
import { ProjectHistoryPagination } from "@/components/dashboard/history/ProjectHistoryPagination"
import { portfolioHistory as MOCK_PROJECTS } from "@/data/portfolioHistory"

export default function HistoryPage() {
    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10">
            {/* Header Section */}
            <ProjectHistoryHeader />

            {/* Filter Section */}
            <ProjectHistoryFilter />

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {MOCK_PROJECTS.map((project, index) => (
                    <HistoryPortfolioCard
                        key={project.id}
                        {...project}
                        delay={index * 0.05}
                    />
                ))}
            </div>

            {/* Pagination Section */}
            <ProjectHistoryPagination />
        </div>
    )
}

