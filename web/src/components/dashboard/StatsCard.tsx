"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string
    icon: LucideIcon
    trend?: string
    trendType?: "up" | "down"
    delay?: number
}

export const StatsCard = memo(({ title, value, icon: Icon, trend, trendType = "up", delay = 0 }: StatsCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="clay-surface p-7 group relative overflow-hidden active:scale-[0.98] transition-transform"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

            <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 shadow-sm shadow-primary/5">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold leading-none ${trendType === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            }`}>
                            {trendType === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {trend}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
                    </div>
                </div>
            </div>
        </motion.div>
    )
})

