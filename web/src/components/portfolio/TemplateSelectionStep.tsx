"use client"

import { motion } from "framer-motion"
import { Zap, ShieldCheck, Palette, ArrowRight, RefreshCw } from "lucide-react"
import { useTemplateStore } from "@/stores/templateStore"
import { projectService } from "@/services/project.service"
import { TemplateDTO } from "@/shared/types"
import { useState, useEffect, memo } from "react"
import Link from "next/link"
import Image from "next/image"

const features = [
    { icon: Zap, title: "Fast Load", desc: "Optimized images and lightweight JS." },
    { icon: ShieldCheck, title: "SEO Ready", desc: "Pre-configured meta tags and schema." },
    { icon: Palette, title: "Themable", desc: "Easily adjust primary accent colors." },
]

interface TemplateSelectionStepProps {
    onContinue: (template: TemplateDTO) => void
}

export const TemplateSelectionStep = ({ onContinue }: TemplateSelectionStepProps) => {
    const { selectedTemplate, setSelectedTemplate } = useTemplateStore()
    const [templates, setTemplates] = useState<TemplateDTO[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await projectService.getTemplates()
                setTemplates(data)
            } catch (err) {
                console.error("Failed to fetch templates", err)
            } finally {
                setLoading(false)
            }
        }
        fetchTemplates()
    }, [])

    // Default to the first template if nothing is selected
    const fallback = templates[0]
    const displayTemplate = selectedTemplate ?? (fallback ? { ...fallback, previewImage: fallback.thumbUrl || "/placeholder.png" } as any : null)

    if (loading) return <div className="h-[400px] clay-surface animate-pulse" />
    if (!displayTemplate) return null

    const handleContinue = () => {
        if (!selectedTemplate && fallback) {
            setSelectedTemplate({ ...fallback, previewImage: fallback.thumbUrl || "/placeholder.png" } as any)
        }
        onContinue(displayTemplate)
    }

    return (
        <div className="space-y-10 max-w-6xl mx-auto flex flex-col items-center">
            <div className="relative group text-center">
                <div className="absolute -inset-2 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <h2 className="relative text-3xl font-black uppercase tracking-tighter leading-none italic">
                    <span className="text-primary italic">01.</span> Confirm Foundation
                </h2>
                <p className="mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40">Architectural Aesthetic Discovery</p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="clay-surface overflow-hidden group shadow-2xl relative w-full border border-primary/20 hover:border-primary/50 transition-all duration-500 rounded-[2rem]"
            >
                <div className="aspect-[21/9] overflow-hidden border-none cursor-default relative">
                    <Image
                        src={displayTemplate.previewImage || displayTemplate.thumbUrl || "/placeholder.png"}
                        alt={displayTemplate.name}
                        width={1200}
                        height={514}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        priority
                    />
                    
                    {/* Tech Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 pointer-events-none opacity-20" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(theme(colors.background),0.4)_100%)] z-10 pointer-events-none" />
                </div>

                <div className="absolute bottom-10 left-10 space-y-4 z-20">
                    <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-[0_0_15px_rgba(theme(colors.primary),0.4)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Selected Blueprint
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none">{displayTemplate.name}</h3>
                        <p className="text-muted-foreground/80 max-w-lg text-xs font-medium leading-relaxed">
                            {displayTemplate.description}
                        </p>
                    </div>
                </div>

                {/* Change Template link */}
                <div className="absolute top-4 right-4">
                    <Link
                        href="/dashboard/templates"
                        className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-black/80 transition-all"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Change Template
                    </Link>
                </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-6 w-full">
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="bg-muted/10 backdrop-blur-xl p-6 space-y-4 border border-border/50 rounded-[1.5rem] group/card hover:border-primary/40 transition-all hover:bg-muted/20"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/card:scale-110 group-hover/card:shadow-[0_0_15px_rgba(theme(colors.primary),0.3)] transition-all">
                            <f.icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest">{f.title}</p>
                            <p className="text-[10px] text-muted-foreground font-medium leading-tight opacity-70">{f.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button
                onClick={handleContinue}
                className="group relative w-full h-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.4em] text-xs active:scale-[0.98] transition-all rounded-2xl shadow-[0_10px_30px_rgba(theme(colors.primary),0.2)] overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-4">
                    Confirm Blueprint & Deploy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </button>
        </div>
    )
}

