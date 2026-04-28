"use client"

import { useEffect, useState } from "react"
import { templateService } from "@/services/template.service"
import { projectService } from "@/services/project.service"
import { TemplateDTO } from "@/shared/types"
import { TemplateCard } from "@/components/templates/TemplateCard"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSnackbar } from "notistack"

interface ClientTemplateGridProps {
    isAdmin?: boolean
    adminKey?: string
    onLoad?: (templates: TemplateDTO[]) => void
    externalSearch?: string
    activeCategory?: string
    showSearchInput?: boolean
    onSelect?: (template: any) => void
}

export function ClientTemplateGrid({ 
    isAdmin, 
    adminKey, 
    onLoad, 
    externalSearch = "", 
    activeCategory = "All",
    showSearchInput = true,
    onSelect
}: ClientTemplateGridProps) {
    const [templates, setTemplates] = useState<TemplateDTO[]>([])
    const [internalSearch, setInternalSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await projectService.getTemplates()
                setTemplates(data)
                onLoad?.(data)
            } catch (err) {
                setError("Failed to load templates. Please try again later.")
            } finally {
                setLoading(false)
            }
        }
        fetchTemplates()
    }, []) // Removing onLoad from deps to avoid infinite loops and triggering fetch

    const combinedSearch = (internalSearch + " " + externalSearch).trim().toLowerCase()
    
    const filteredTemplates = templates.filter(t => {
        const name = t.name || ""
        const domain = t.domain || ""
        const techStack = t.techStack || []

        const matchesSearch = combinedSearch === "" || (
            name.toLowerCase().includes(combinedSearch) ||
            domain.toLowerCase().includes(combinedSearch) ||
            techStack.some(tech => tech.toLowerCase().includes(combinedSearch))
        )
        
        const matchesCategory = activeCategory === "All" || (
            domain.toLowerCase() === activeCategory.toLowerCase()
        )
        
        return matchesSearch && matchesCategory;
    })

    const handleDelete = async (id: string) => {
        if (!isAdmin || !adminKey) return
        if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) return

        // Proactive Key Verification
        const isKeyValid = await templateService.verifyKey(adminKey)
        if (!isKeyValid) {
            enqueueSnackbar("Authentication Failed: Invalid Admin Secret Signature.", { 
                variant: "error",
                style: { background: "#ef4444", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" }
            })
            return
        }

        try {
            await templateService.deleteTemplate(id, adminKey)
            setTemplates(templates.filter(t => t.id !== id))
            enqueueSnackbar("Template successfully deleted.", { variant: "success", style: { background: "#10b981", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
        } catch (err: any) {
            const msg = err.response?.status === 401 || err.response?.status === 403 
                ? "Invalid Admin Key. Access Denied." 
                : "Failed to delete template. it might be in use by projects.";
            enqueueSnackbar(msg, { variant: "error", style: { background: "#ef4444", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-[400px] clay-surface animate-pulse bg-muted/20" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 clay-surface bg-destructive/5 border-destructive/20 text-destructive text-center space-y-4">
                <p className="font-bold">{error}</p>
                <button 
                    onClick={() => { setLoading(true); setError(null); /* retry logic */ }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (templates.length === 0) {
        return (
            <div className="text-center py-20 clay-surface bg-muted/10">
                <p className="text-muted-foreground font-medium">No templates available yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {showSearchInput && (
                <div className="relative group max-w-md">
                    <input
                        type="text"
                        placeholder="Search blueprints by name, tech, or domain..."
                        className="w-full h-12 bg-muted/40 border border-border/50 rounded-2xl px-6 font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                        value={internalSearch}
                        onChange={(e) => setInternalSearch(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                        <Loader2 className={cn("w-4 h-4", loading && "animate-spin")} />
                    </div>
                </div>
            )}

            {filteredTemplates.length === 0 && !loading ? (
                <div className="text-center py-32 bg-card/20 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-border/30">
                    <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6 text-muted-foreground/40">
                        <Loader2 className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">No matching blueprints found</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">Adjust your filters or try a different search term.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
                    {filteredTemplates.map((tpl, i) => (
                        <TemplateCard 
                            key={tpl.id} 
                            {...tpl} 
                            previewImage={tpl.thumbUrl || "/placeholder.png"}
                            previews={tpl.previews}
                            delay={i * 0.05} 
                            onDelete={isAdmin ? () => handleDelete(tpl.id) : undefined}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

