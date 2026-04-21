"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { MoreVertical, Layers, Clock, Eye, Edit3, Globe, Trash2, ExternalLink, Copy, Check, ChevronDown, Monitor, Code, Loader2 as LucideLoader } from "lucide-react"
import { projectService } from "@/services/project.service"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useSnackbar } from "notistack"
import { useRouter } from "next/navigation"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

interface PortfolioCardProps {
    id: number
    title: string
    template: string
    status: "Live" | "Draft"
    lastEdited: string
    views: number
    imageUrl?: string
    previewUrl?: string | null
    delay?: number
    onDelete?: (id: number) => void
}

export const PortfolioCard = memo(({
    id,
    title,
    template,
    status,
    lastEdited,
    views,
    imageUrl,
    previewUrl,
    delay = 0,
    onDelete
}: PortfolioCardProps) => {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isOpeningVSCode, setIsOpeningVSCode] = React.useState(false)
    const [copied, setCopied] = React.useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const handleCopyLink = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (previewUrl) {
            navigator.clipboard.writeText(previewUrl)
            setCopied(true)
            enqueueSnackbar("URL copied to clipboard!", { variant: "success", autoHideDuration: 2000 })
            setTimeout(() => setCopied(false), 2000)
        } else {
            enqueueSnackbar("Live URL not available.", { variant: "info" })
        }
    }

    const handleOpenVSCode = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            setIsOpeningVSCode(true)
            const diskPath = await projectService.getDiskPath(id)
            // VS Code protocol: vscode://file/{path}
            window.location.href = `vscode://file/${diskPath}`
            enqueueSnackbar("Launching VS Code...", { variant: "info" })
        } catch (err) {
            enqueueSnackbar("Failed to locate local instance files.", { variant: "error" })
        } finally {
            setIsOpeningVSCode(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!confirm(`Are you sure you want to delete "${title}"? This will permanently remove all instance files and snapshots.`)) {
            return
        }

        try {
            setIsDeleting(true)
            await projectService.deleteProject(id)
            enqueueSnackbar("Project deleted successfully.", { variant: "success", style: { background: "#10b981", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
            onDelete?.(id)
        } catch (err) {
            enqueueSnackbar("Failed to delete project. Please try again.", { variant: "error", style: { background: "#ef4444", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -8 }}
            className="clay-surface group overflow-hidden transition-all flex flex-col p-4 bg-card/60 border-primary/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
        >
            {/* Thumbnail Viewport */}
            <div className="aspect-[16/10] relative overflow-hidden rounded-[1.5rem] bg-muted/40 shadow-inner group-hover:shadow-primary/10 transition-all">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out grayscale-[0.2] group-hover:grayscale-0"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,var(--primary-opacity),transparent)]">
                        <Layers className="w-14 h-14 text-primary/20 animate-pulse" />
                    </div>
                )}

                {/* Glass Status Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 backdrop-blur-xl border border-white/10 shadow-2xl ${
                        status === "Live" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === "Live" ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-amber-400"}`} />
                        {status}
                    </span>
                </div>

                {/* Tactical Action Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    {status === "Live" && previewUrl && (
                        <Button 
                            onClick={(e) => { e.stopPropagation(); window.open(previewUrl, '_blank'); }}
                            className="bg-white text-black hover:bg-primary hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-2xl transition-all hover:scale-105 active:scale-95"
                        >
                            Open Live <ExternalLink className="w-3.5 h-3.5 ml-2" />
                        </Button>
                    )}
                    <Button 
                        onClick={handleCopyLink}
                        variant="secondary"
                        className="bg-background/80 hover:bg-background rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-4 backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                </div>
            </div>

            <div className="pt-8 pb-3 px-3 space-y-5 flex-1 flex flex-col">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-primary/5 border border-primary/10">
                            <Globe className="w-3 h-3 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-primary/80">{template} Architecture</span>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">#{id.toString().padStart(4, '0')}</p>
                    </div>
                    <h3 className="font-black text-xl italic tracking-tighter uppercase leading-tight group-hover:text-primary transition-colors truncate">{title}</h3>
                </div>

                <div className="flex items-center gap-6 py-4 border-y border-border/40">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Last Evolution</span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5 text-primary/40" />
                            <span>{lastEdited}</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-border/40" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Node Traffic</span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <Eye className="w-3.5 h-3.5 text-primary/40" />
                            <span>{views} Interactions</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                    <div className="flex flex-1 items-center gap-0">
                        <Link href={`/dashboard/portfolios/builder?projectId=${id}`} className="flex-1">
                            <Button className="w-full bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/20 h-12 rounded-l-2xl rounded-r-none gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 group/btn border-r border-white/10">
                                <Edit3 className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                                Modify Logic
                            </Button>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    className="h-12 w-10 bg-primary/95 text-primary-foreground hover:bg-primary rounded-r-2xl rounded-l-none border-l border-primary/20 active:scale-95 transition-all"
                                    title="Switch Editor"
                                >
                                    <ChevronDown className="w-4 h-4 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 p-2 rounded-2xl bg-popover/95 backdrop-blur-xl border-white/5 shadow-2xl" align="end" sideOffset={10}>
                                <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 px-2 py-1.5">Choose IDE Matrix</DropdownMenuLabel>
                                
                                <DropdownMenuItem 
                                    onSelect={() => router.push(`/dashboard/portfolios/builder?projectId=${id}`)}
                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors group/item"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                        <Monitor className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest group-hover/item:text-primary transition-colors">Antigravity</span>
                                        <span className="text-[8px] opacity-40 font-bold uppercase italic">Native Web IDE</span>
                                    </div>
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator className="bg-white/5 my-1" />
                                
                                <DropdownMenuItem 
                                    onSelect={handleOpenVSCode}
                                    disabled={isOpeningVSCode}
                                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors group/item"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Code className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest group-hover/item:text-blue-400 transition-colors">VS Code</span>
                                        <span className="text-[8px] opacity-40 font-bold uppercase italic">Local Instance</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-12 w-12 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-2xl border border-border/40 active:scale-95 transition-all"
                    >
                        {isDeleting ? (
                            <LucideLoader className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4.5 h-4.5" />
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    )
})

