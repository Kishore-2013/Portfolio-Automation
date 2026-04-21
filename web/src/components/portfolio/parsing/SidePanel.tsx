"use client"

import { AlertCircle, Rocket, ChevronDown, Sparkles, ArrowRight } from "lucide-react"
import { GlassCard } from "./UIComponents"
import { ReconciliationData } from "./types"

interface SidePanelProps {
    data: ReconciliationData;
}

export const SidePanel = ({ data }: SidePanelProps) => {
    return (
        <div className="lg:col-span-4 space-y-8">
            {/* Missing Requirements */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-black text-xs uppercase tracking-[0.2em]">Required Actions</h3>
                </div>
                <div className="space-y-4">
                    {(data.missingRequired ?? []).map(item => (
                        <GlassCard key={item.id} className="border-amber-500/20 bg-amber-500/[0.02] p-8 space-y-4 shadow-amber-500/[0.02]">
                            <div className="space-y-2">
                                <h4 className="font-black text-base tracking-tight">{item.title}</h4>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <input
                                    placeholder={item.placeholder}
                                    className="w-full bg-background border border-border/50 px-4 h-12 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
                                />
                                <button className="h-12 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2">
                                    Complete Field
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Orphaned Snippets */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <Rocket className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-black text-xs uppercase tracking-[0.2em]">Contextual Data</h3>
                </div>
                <div className="space-y-4">
                    {(data.orphanedData ?? []).map(item => (
                        <GlassCard key={item.id} className="p-8 space-y-6 hover:translate-y-[-2px] transition-transform">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <h5 className="font-black text-xs uppercase tracking-tight">{item.title}</h5>
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic opacity-80">"{item.content}"</p>
                            <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-2">
                                <button className="h-10 bg-muted/50 hover:bg-muted text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">Map Entry</button>
                                <button className="h-10 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 rounded-lg transition-all">Discard</button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Template Smart Card */}
            <GlassCard className="bg-primary p-8 border-none text-primary-foreground space-y-6 shadow-2xl shadow-primary/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -z-0 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 space-y-4 text-center">
                    <Sparkles className="w-10 h-10 mx-auto opacity-80 animate-pulse" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Final Destination</p>
                        <p className="text-xl font-black">Neo-Noir Theme</p>
                    </div>
                    <button className="w-full h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/20">
                        View Config
                    </button>
                </div>
            </GlassCard>
        </div>
    )
}

