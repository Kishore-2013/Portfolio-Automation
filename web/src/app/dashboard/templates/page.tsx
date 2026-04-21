"use client"

import { useState } from "react"
import { Layout, Palette, Code2, Sparkles } from "lucide-react"
import { TemplateStats } from "@/components/templates/TemplateStats"
import { TemplateFilters } from "@/components/templates/TemplateFilters"
import { CustomLayoutBanner } from "@/components/templates/CustomLayoutBanner"
import { ClientTemplateGrid } from "@/components/templates/ClientTemplateGrid"
import { motion } from "framer-motion"

function TemplatesHeader() {
    return (
        <div className="space-y-4">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
            >
                <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        Premium Blueprints
                    </span>
                </div>
            </motion.div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                        Portfolio <br/>
                        <span className="text-primary italic">Library.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                        Discover professional themes tailored for the modern developer. Each template is rigorously tested for SEO, accessibility, and mobile performance.
                    </p>
                </div>
                
                <div className="hidden lg:flex flex-col items-end gap-2 grayscale opacity-40">
                    <div className="flex gap-4">
                        <Palette className="w-6 h-6" />
                        <Code2 className="w-6 h-6" />
                        <Layout className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Standard Compliant</p>
                </div>
            </div>
        </div>
    )
}

export default function TemplatesPage() {
    const [search, setSearch] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")

    return (
        <div className="relative min-h-screen bg-background">
            {/* Background Decorations */}
            <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4" />

            <div className="relative p-4 lg:p-8 space-y-10 max-w-[1600px] mx-auto pb-32">
                <TemplatesHeader />
                
                <div className="space-y-4">
                    <TemplateStats />
                    <TemplateFilters 
                        search={search}
                        onSearchChange={setSearch}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </div>
                
                <div className="pt-6">
                    <ClientTemplateGrid 
                        externalSearch={search}
                        activeCategory={activeCategory}
                        showSearchInput={false}
                    />
                </div>

                <div className="pt-12">
                    <CustomLayoutBanner />
                </div>

                {/* Footer Attribution */}
                <div className="pt-24 border-t border-border/10 flex items-center justify-between opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em]">
                        Portfoilo Automation Engine v2.0
                    </p>
                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                        <span>Library Ver: 1.4.2</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

