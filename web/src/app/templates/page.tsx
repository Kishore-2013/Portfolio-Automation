"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar/navbar"
import { Footer } from "@/components/sections/footer"
import { ClientTemplateGrid } from "@/components/templates/ClientTemplateGrid"
import { 
    LayoutGrid, 
    Sparkles, 
    Zap, 
    ShieldCheck, 
    ArrowRight,
    Search,
    Filter
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export default function TemplateExplorerPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isChoosing = searchParams.get("mode") === "select"
    
    const [activeCategory, setActiveCategory] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")

    const categories = [
        "All",
        "Developer",
        "Creative",
        "Personal",
        "Minimalist"
    ]

    const handleSelect = (id: string) => {
        // Redirect to the creation flow with the selected template ID
        router.push(`/dashboard/portfolios/create?templateId=${id}`)
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/2" />
            
            <Navbar />

            <main className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-16">
                {/* Header Section */}
                <div className="space-y-6 text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-widest"
                    >
                        <Sparkles className="w-3 h-3" />
                        {isChoosing ? "Step 1: Choose Your Architecture" : "Template Library"}
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter leading-none"
                    >
                        Pick a <span className="text-primary italic">Blueprint.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground font-medium"
                    >
                        Every template is hand-crafted for high performance, SEO optimization, and stunning aesthetics. Select one to begin your transformation.
                    </motion.p>
                </div>

                {/* Filter / Search Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-border/50">
                    <div className="flex items-center gap-2 p-1.5 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/50 overflow-x-auto max-w-full">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0",
                                    activeCategory === cat 
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search architecture..."
                            className="w-full h-12 bg-muted/20 border border-border/50 rounded-2xl pl-12 pr-6 font-bold focus:outline-none focus:border-primary/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Template Grid */}
                <ClientTemplateGrid 
                    activeCategory={activeCategory}
                    externalSearch={searchQuery}
                    showSearchInput={false}
                    onSelect={handleSelect}
                />

                {/* Tech Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-24 border-t border-border/10">
                    <div className="flex items-start gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">Turbo Powered</h4>
                            <p className="text-xs text-muted-foreground mt-1">Built with Next.js 15 for sub-second page loads and perfect Core Web Vitals.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">Responsive Grid</h4>
                            <p className="text-xs text-muted-foreground mt-1">Mobile-first fluid layouts that look stunning on everything from 4K to iPhone.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight">SEO Fortified</h4>
                            <p className="text-xs text-muted-foreground mt-1">Pre-configured meta tags, sitemaps, and semantic HTML for instant ranking.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
