"use client"

import { Search, Filter, Grid, List, ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export const ProjectHistoryFilter = () => {
    const [view, setView] = useState<"grid" | "list">("grid")

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 p-1.5 bg-card/50 rounded-3xl border border-border backdrop-blur-md">
            <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-4 px-3 py-1">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by project name..."
                        className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border border-border rounded-2xl text-xs font-bold text-muted-foreground/70 uppercase tracking-widest cursor-pointer hover:bg-muted/50 transition-all group">
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filter by:</span>
                        <span className="text-foreground ml-2">All Templates</span>
                        <ChevronDown className="w-3.5 h-3.5 ml-2 group-active:rotate-180 transition-transform" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-6 px-4 py-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
                    Showing <span className="text-foreground">6 of 24</span> projects
                </div>

                <div className="flex p-1 bg-muted/30 rounded-xl border border-border">
                    <button
                        onClick={() => setView("grid")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            view === "grid"
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Grid className="w-3.5 h-3.5" />
                        <span>Grid</span>
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            view === "list"
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <List className="w-3.5 h-3.5" />
                        <span>List</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

