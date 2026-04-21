import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { ClientProjectGrid } from "@/components/dashboard/ClientProjectGrid"
import { StorageStatus } from "@/components/dashboard/StorageStatus"
import { TipCard } from "@/components/dashboard/TipCard"

export default function DashboardHome() {
    return (
        <div className="relative p-4 lg:p-8 space-y-16 max-w-[1600px] mx-auto min-h-screen">
            {/* Decorative Blur Backgrounds - Static CSS only */}
            <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            {/* Storage Warning if needed */}
            <StorageStatus />

            {/* Hero Header Section - Client side for name and animations */}
            <DashboardHeader />

            {/* Stats Summary Section */}
            <StatsGrid />

            {/* Projects Section */}
            <ClientProjectGrid />

            {/* Insights / Tips Section */}
            <TipCard />
        </div>
    )
}

