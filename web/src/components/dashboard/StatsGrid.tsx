"use client"

import { StatsCard } from "@/components/dashboard/StatsCard"
import { dashboardStats as stats } from "@/data/dashboard"
import React, { memo } from "react"

export const StatsGrid = memo(() => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <StatsCard key={stat.title} {...stat} delay={i * 0.1 + 0.3} />
            ))}
        </div>
    )
})

