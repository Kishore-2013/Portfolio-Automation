"use client"

import { Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

import { templateCategories as categories } from "@/data/templates"

interface TemplateFiltersProps {
    search: string
    onSearchChange: (value: string) => void
    activeCategory: string
    onCategoryChange: (category: string) => void
}

export const TemplateFilters = ({
    search,
    onSearchChange,
    activeCategory,
    onCategoryChange
}: TemplateFiltersProps) => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-8 border-t border-border/10">
            <div className="flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar py-2">
                <div className="flex items-center gap-3 text-muted-foreground mr-6 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                        <Filter className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Curation:</span>
                </div>
                <div className="flex items-center gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange(cat)}
                            className={cn(
                                "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                                activeCategory === cat
                                    ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                                    : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted hover:border-border/50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative group max-w-md w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                <input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by tech, style or name..."
                    className="w-full bg-muted/40 border-2 border-transparent pl-16 h-14 rounded-2xl focus:outline-none focus:border-primary/30 focus:bg-background transition-all text-sm font-bold shadow-inner"
                />
                
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <div className="px-2 py-1 rounded bg-muted/30 text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 border border-border/50">
                        Search
                    </div>
                </div>
            </div>
        </div>
    )
}

