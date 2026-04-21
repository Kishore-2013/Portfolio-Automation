"use client"

import { useEffect, useState } from "react"
import { projectService } from "@/services/project.service"
import { ProjectDTO } from "@/shared/types"
import { PortfolioCard } from "@/components/dashboard/PortfolioCard"
import { CreatePortfolioCard } from "@/components/dashboard/CreatePortfolioCard"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Plus } from "lucide-react"

export function ClientProjectGrid() {
    const [projects, setProjects] = useState<ProjectDTO[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectService.getProjects()
                setProjects(data)
            } catch (err) {
                console.error("Failed to fetch projects", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-[350px] clay-surface animate-pulse bg-muted/20" />
                ))}
            </div>
        )
    }

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        Your Portfolios
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">Manage your existing projects and deployments.</p>
                </div>
                <Button variant="link" className="text-primary font-black hover:no-underline group/link transition-all uppercase tracking-widest text-[10px] gap-2">
                    View Library
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((item, i) => (
                    <PortfolioCard 
                        key={item.id} 
                        id={item.id}
                        title={item.name}
                        template={item.templateId}
                        status={(item.status === 'READY' || item.status === 'SLEEPING') ? "Live" : "Draft"}
                        lastEdited={item.lastSavedAt ? new Date(item.lastSavedAt).toLocaleDateString() : "Never"}
                        views={0}
                        imageUrl={undefined}
                        previewUrl={item.previewUrl}
                        delay={0.1 + i * 0.1} 
                        onDelete={(deletedId) => setProjects(prev => prev.filter(p => p.id !== deletedId))}
                    />
                ))}
                <CreatePortfolioCard delay={0.4} />
            </div>
        </section>
    )
}

