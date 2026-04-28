"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Globe, 
    Zap, 
    Share2, 
    BarChart3, 
    TrendingUp, 
    MousePointer2,
    Eye,
    Clock,
    CheckCircle2,
    ShieldCheck,
    ArrowUpRight,
    Server,
    Activity,
    LineChart,
    ExternalLink
} from "lucide-react"
import { projectService } from "@/services/project.service"
import { ProjectDTO } from "@/shared/types"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { PortfolioCard } from "@/components/dashboard/PortfolioCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PortfoliosPage() {
    const [projects, setProjects] = useState<ProjectDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await projectService.getProjects()
                setProjects(data)
            } catch (e) {
                // Ignore fetch failure
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const liveCount = projects.filter(p => p.status === 'READY' || p.status === 'SLEEPING').length
    const activeProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null

    return (
        <div className="relative p-4 lg:p-8 space-y-12 max-w-[1700px] mx-auto pb-32">
            {/* Background Decorations */}
            <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

            {/* Header / Network Status */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Global CDN: Active
                        </span>
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                        Live <br/>
                        <span className="text-primary italic">Deployments.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium max-w-2xl">
                        Orchestrate and monitor your digital fleet. Your architecture spans <span className="text-foreground font-bold">{liveCount} global edge nodes</span> with sub-20ms latency.
                    </p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="clay-surface p-8 bg-background/40 backdrop-blur-2xl border-primary/20 shadow-2xl flex items-center gap-8 group"
                >
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Server className="w-10 h-10" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Active Portfolios</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black tabular-nums">{liveCount}</span>
                            <span className="text-emerald-500 text-xs font-bold leading-none flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +100% Correct
                            </span>
                        </div>
                        <div className="mt-3 flex gap-1.5">
                            {[1,2,3].map(i => (
                                <div key={i} className={`h-1 rounded-full bg-emerald-500 ${i === 3 ? 'w-12 opacity-30' : 'w-4'}`} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Live Nodes" 
                    value={liveCount.toString()} 
                    icon={Globe} 
                    trend="+12%" 
                    trendType="up"
                    delay={0.1}
                />
                <StatsCard 
                    title="Total Traffic" 
                    value="1.2k" 
                    icon={MousePointer2} 
                    trend="+4.3%" 
                    trendType="up"
                    delay={0.2}
                />
                <StatsCard 
                    title="Avg Performance" 
                    value="98.2" 
                    icon={Zap} 
                    trend="Stable" 
                    trendType="up"
                    delay={0.3}
                />
                <StatsCard 
                    title="Global Reach" 
                    value="24 Countries" 
                    icon={Share2} 
                    trend="Expandin" 
                    trendType="up"
                    delay={0.4}
                />
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-12">
                
                {/* Deployment List */}
                <div className="2xl:col-span-8 space-y-8">
                    <div className="flex items-center justify-between border-b border-border/50 pb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-black italic tracking-tight">Active Infrastructure</h2>
                            <span className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">{projects.length} Total</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monitoring Sync Complete</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-[350px] clay-surface animate-pulse bg-muted/20 rounded-[2.5rem]" />
                            ))
                        ) : (
                            projects.map((p, i) => (
                                <div key={p.id} className="relative group">
                                    <PortfolioCard 
                                        id={p.id}
                                        title={p.name}
                                        template={p.templateId}
                                        status={(p.status === 'READY' || p.status === 'SLEEPING') ? "Live" : "Draft"}
                                        lastEdited={p.lastSavedAt ? new Date(p.lastSavedAt).toLocaleDateString() : "Never"}
                                        views={Math.floor(Math.random() * 800) + 50}
                                        previewUrl={p.previewUrl}
                                        delay={i * 0.1}
                                        onDelete={(id) => setProjects(prev => prev.filter(proj => proj.id !== id))}
                                    />
                                    {p.previewUrl && (
                                        <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a 
                                                href={p.previewUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl"
                                                title="Open Live Link"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        {!loading && projects.length === 0 && (
                            <div className="col-span-full py-32 text-center clay-surface bg-muted/5 border-dashed border-2 border-border/50 rounded-[3rem] space-y-4">
                                <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground/30">
                                    <Globe className="w-10 h-10" />
                                </div>
                                <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-sm">No deployments detected in this region.</p>
                                <Link href="/templates?mode=select">
                                    <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-10">Initialize New Project</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tactical Analytics Sidebar */}
                <div className="2xl:col-span-4 space-y-10">
                    
                    {/* Real-time Traffic Simulation */}
                    <div className="clay-surface p-10 bg-background/50 backdrop-blur-3xl border-border/50 shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <Activity className="w-40 h-40" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black italic tracking-tight flex items-center gap-4 text-foreground uppercase">
                                <Activity className="w-6 h-6 text-primary" /> Traffic Flow
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Updates</span>
                        </div>

                        <div className="space-y-8 relative z-10">
                            {[
                                { label: "Direct Traffic", value: 64, color: "bg-primary" },
                                { label: "Organic Search", value: 22, color: "bg-blue-500" },
                                { label: "Social Referrals", value: 14, color: "bg-purple-500" },
                            ].map((item, idx) => (
                                <div key={item.label} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                                            <p className="text-xl font-black tracking-tighter">{item.value}% <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-normal line-through ml-1">{(item.value * 0.9).toFixed(0)}%</span></p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px]">
                                            <TrendingUp className="w-3 h-3" /> +2.4%
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/20 p-[2px]">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.value}%` }}
                                            transition={{ delay: 1 + idx * 0.1, duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${item.color} shadow-lg shadow-black/20`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-6 border-t border-border/50 group flex items-center justify-between cursor-pointer">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Advanced Breakdown</span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </div>
                    </div>

                    {/* Performance Health */}
                    <div className="clay-surface p-10 bg-indigo-500/5 border-indigo-500/20 shadow-2xl space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <LineChart className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight uppercase tracking-[0.1em]">Engine Pulse</h3>
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">Global Infrastructure Health</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-background/40 rounded-3xl border border-border group hover:bg-background/60 transition-all cursor-default">
                                <p className="text-[9px] font-black uppercase text-muted-foreground mb-2">Avg Latency</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-black tracking-tight text-emerald-500">14ms</span>
                                    <Activity className="w-4 h-4 text-emerald-500/30 group-hover:animate-pulse" />
                                </div>
                            </div>
                            <div className="p-5 bg-background/40 rounded-3xl border border-border group hover:bg-background/60 transition-all cursor-default">
                                <p className="text-[9px] font-black uppercase text-muted-foreground mb-2">Build Velocity</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-black tracking-tight text-primary">0.82s</span>
                                    <Zap className="w-4 h-4 text-primary/30 group-hover:animate-bounce" />
                                </div>
                            </div>
                            <div className="p-5 bg-background/40 rounded-3xl border border-border group hover:bg-background/60 transition-all cursor-default col-span-2">
                                <p className="text-[9px] font-black uppercase text-muted-foreground mb-2 text-center">Auto-Scaling Threshold</p>
                                <div className="flex items-center justify-center gap-6">
                                    <span className="text-3xl font-black tracking-tighter uppercase italic">Optimized</span>
                                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Deployment Registry - Table View */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="clay-surface p-10 bg-background/30 backdrop-blur-md border-border/40 shadow-xl space-y-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Deployment <span className="text-primary italic">Registry.</span></h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Global Cluster Node Persistence</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40">
                                <th className="text-left py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4">Node Designation</th>
                                <th className="text-left py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4">Architecture</th>
                                <th className="text-left py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4">Persistent Link</th>
                                <th className="text-left py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4">Status</th>
                                <th className="text-right py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-4">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p.id} className="border-b border-border/20 group hover:bg-primary/[0.02] transition-colors">
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                <Server className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase italic tracking-tight">{p.name}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ID: {p.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="px-3 py-1 bg-muted/50 rounded-lg text-[9px] font-black uppercase tracking-widest border border-border/50 italic">
                                            {p.templateId}
                                        </span>
                                    </td>
                                    <td className="py-6 px-4">
                                        {p.previewUrl ? (
                                            <a 
                                                href={p.previewUrl} 
                                                target="_blank" 
                                                className="text-primary hover:underline flex items-center gap-2 text-[10px] font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform"
                                            >
                                                {p.name || "node-" + p.id} <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest italic">Local Instance Only</span>
                                        )}
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${p.status === 'READY' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{p.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Button 
                                                onClick={() => window.open(`/dashboard/portfolios/builder?projectId=${p.id}`, '_self')}
                                                variant="ghost" 
                                                className="h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-transparent hover:border-primary/20"
                                            >
                                                Configure
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}

