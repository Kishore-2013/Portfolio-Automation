"use client"

import { motion } from "framer-motion"
import { MoreVertical, Layout, Calendar, ExternalLink, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import React, { memo } from "react"

interface HistoryPortfolioCardProps {
    title: string
    template: string
    status: "Published" | "Draft" | "Live"
    lastModified: string
    imageUrl: string
    delay?: number
}

export const HistoryPortfolioCard = memo(({
    title,
    template,
    status,
    lastModified,
    imageUrl,
    delay = 0
}: HistoryPortfolioCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-primary/5"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image
                    src={imageUrl}
                    alt={title}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg",
                        status === "Published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-background/80 text-foreground/70 border-border/50"
                    )}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {title}
                    </h3>
                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                        <Layout className="w-3.5 h-3.5 text-primary/70" />
                        <span>{template}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-medium bg-muted/50 px-3 py-2 rounded-xl border border-border/40">
                        <Calendar className="w-3.5 h-3.5 text-primary/70" />
                        <span>Last modified: {lastModified}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    <Button className="flex-1 bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 rounded-xl h-11 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                    </Button>
                    <Button variant="outline" className="w-11 h-11 p-0 border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl flex items-center justify-center transition-all active:scale-[0.98]">
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    )
})

