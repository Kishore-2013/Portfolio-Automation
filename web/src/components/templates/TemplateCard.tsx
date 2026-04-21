"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowRight, Star, Zap, Cpu, Globe, Monitor,
    Trash2, X, ChevronLeft, ChevronRight, Maximize2,
    Layers, Layout, ShieldCheck, Github
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTemplateStore, Template } from "@/stores/templateStore"
import Image from "next/image"
import React, { memo } from "react"

interface TemplateCardProps extends Template {
    delay?: number
    onDelete?: (id: string) => void
}

export const TemplateCard = memo(({
    id,
    name,
    description,
    previewImage,
    previews = [],
    files,
    category = "General",
    tags = ["React", "Customizable"],
    badge,
    delay = 0,
    onDelete,
    gitRepoUrl,
}: TemplateCardProps) => {
    const router = useRouter()
    const setSelectedTemplate = useTemplateStore((state) => state.setSelectedTemplate)
    const [imageIndex, setImageIndex] = React.useState(0)
    const [isHovered, setIsHovered] = React.useState(false)
    const [showPopup, setShowPopup] = React.useState(false)
    const [hoverProgress, setHoverProgress] = React.useState(0)

    // Combine thumbnail and previews for a complete gallery
    const gallery = React.useMemo(() => {
        const items = [previewImage, ...previews].filter(Boolean) as string[]
        return items.length > 0 ? items : ["/placeholder.png"]
    }, [previewImage, previews])

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        if (isHovered && !showPopup) {
            const startTime = Date.now();
            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                setHoverProgress(Math.min((elapsed / 2000) * 100, 100));
            }, 50);

            timer = setTimeout(() => {
                // Removed auto-open on hover per new requirement: "give the popup onclick"
                setHoverProgress(0);
            }, 2000);
        } else {
            setHoverProgress(0);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        };
    }, [isHovered, showPopup]);

    // Looping gallery check
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHovered && gallery.length > 1 && !showPopup) {
            interval = setInterval(() => {
                setImageIndex((prev) => (prev + 1) % gallery.length);
            }, 1500);
        } else if (!isHovered && !showPopup) {
            setImageIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, gallery.length, showPopup]);

    const handleUseTemplate = () => {
        setSelectedTemplate({ id, name, description, previewImage, previews, files, gitRepoUrl })
        router.push("/dashboard/portfolios/create")
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setShowPopup(true)}
                transition={{ duration: 0.4, delay, ease: "easeOut" }}
                className="group relative flex flex-col bg-card rounded-[2rem] overflow-hidden border border-border transition-all duration-300 hover:border-primary/40 hover:shadow-xl dark:hover:shadow-primary/5 cursor-pointer"
            >
                {/* Visual Header */}
                <div className="relative h-60 w-full overflow-hidden p-2.5 pb-0">
                    <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-muted shadow-inner">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={gallery[imageIndex]}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={gallery[imageIndex] || "/placeholder.png"}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                    loading="lazy"
                                />
                            </motion.div>
                        </AnimatePresence>
                        
                        {/* Progress Bar */}
                        {isHovered && hoverProgress > 0 && !showPopup && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 z-30">
                                <motion.div 
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${hoverProgress}%` }}
                                />
                            </div>
                        )}

                        {/* Top Utility Row */}
                        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                            <div className="px-2 py-1 rounded-lg bg-background/95 dark:bg-black/70 backdrop-blur-md border border-border shadow-sm text-[8px] font-black uppercase tracking-widest text-foreground dark:text-white flex items-center gap-1.5 transition-transform group-hover:scale-105">
                                <Monitor className="w-2.5 h-2.5 text-primary" />
                                {category}
                            </div>
                            
                            <div className="flex flex-col gap-1.5 items-end opacity-0 group-hover:opacity-100 transition-all">
                                {badge && (
                                    <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[7px] font-black uppercase tracking-widest rounded shadow-lg shadow-primary/20">
                                        {badge}
                                    </span>
                                )}
                                <div className="flex gap-1.5">
                                    {onDelete && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(id); }}
                                            className="w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPopup(true); }}
                                        className="w-8 h-8 rounded-lg bg-background border border-border text-foreground flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Pagination Dots */}
                        {gallery.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 p-1 bg-black/30 backdrop-blur-sm rounded-full">
                                {gallery.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "h-1 rounded-full transition-all duration-300",
                                            i === imageIndex ? "bg-white w-4" : "bg-white/40 w-1"
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Deck */}
                <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                            {tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-[8px] font-bold uppercase tracking-widest text-muted-foreground border border-transparent">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-lg font-black italic tracking-tight text-foreground uppercase leading-tight group-hover:text-primary transition-colors">
                                {name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-medium leading-normal line-clamp-2">
                                {description}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleUseTemplate(); }}
                        className="mt-auto w-full h-11 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[9px] rounded-xl transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/10"
                    >
                        Select Architecture <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </motion.div>

            {/* Blueprint Overlay Modal */}
            <AnimatePresence>
                {showPopup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPopup(false)}
                            className="absolute inset-0 bg-background/60 dark:bg-black/80 backdrop-blur-2xl"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="relative w-full max-w-7xl max-h-[90vh] bg-card rounded-[2.5rem] overflow-hidden border border-border shadow-2xl flex flex-col lg:flex-row"
                        >
                            {/* Close Action */}
                            <button 
                                onClick={() => setShowPopup(false)}
                                className="absolute top-6 right-6 z-50 w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow hover:bg-muted transition-all active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Gallery Viewport */}
                            <div className="relative flex-1 bg-muted/30 overflow-hidden group/modal-gallery">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={imageIndex}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
                                    >
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border/20">
                                            <Image
                                                src={gallery[imageIndex] || "/placeholder.png"}
                                                alt={name}
                                                fill
                                                className="object-contain"
                                                priority
                                            />
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover/modal-gallery:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setImageIndex((p) => (p - 1 + gallery.length) % gallery.length); }}
                                        className="pointer-events-auto w-10 h-10 rounded-lg bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setImageIndex((p) => (p + 1) % gallery.length); }}
                                        className="pointer-events-auto w-10 h-10 rounded-lg bg-background/80 backdrop-blur-md border border-border flex items-center justify-center shadow-lg"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Strip Navigator */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 bg-background/40 backdrop-blur-xl rounded-2xl border border-border flex gap-2 shadow-2xl overflow-x-auto max-w-[90%]">
                                    {gallery.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setImageIndex(i); }}
                                            className={cn(
                                                "relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                                                i === imageIndex ? "border-primary scale-110 shadow" : "border-transparent opacity-50 hover:opacity-100"
                                            )}
                                        >
                                            <Image src={img || "/placeholder.png"} alt={`nav-${i}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Details Deck */}
                            <div className="w-full lg:w-[420px] p-8 md:p-10 flex flex-col justify-between border-l border-border bg-card">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black uppercase tracking-widest text-primary">
                                                Verified Blueprint
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none">
                                            {name}
                                        </h2>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-muted/30 border border-border">
                                            <Layout className="w-3.5 h-3.5 text-primary" />
                                            <p className="text-[7px] font-black uppercase text-muted-foreground/60">Category</p>
                                            <p className="text-[10px] font-bold text-foreground uppercase truncate">{category}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-muted/30 border border-border">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                            <p className="text-[7px] font-black uppercase text-muted-foreground/60">Security</p>
                                            <p className="text-[10px] font-bold text-foreground uppercase truncate">Standard</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border pb-1">Technical Stack</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded-md bg-muted border border-border text-[8px] font-bold text-foreground/70">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-8">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleUseTemplate(); }}
                                        className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] shadow-primary/10"
                                    >
                                        Use This Blueprint <ArrowRight className="w-4 h-4" />
                                    </button>
                                    {gitRepoUrl && (
                                        <a 
                                            href={gitRepoUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="w-full h-12 bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest text-[9px] rounded-lg flex items-center justify-center gap-2 border border-border transition-all"
                                        >
                                            <Github className="w-3.5 h-3.5" /> Source Code
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
})

