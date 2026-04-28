"use client"

import { motion } from "framer-motion"
import { Undo2, Rocket } from "lucide-react"
import { ReconciliationData } from "./types"

interface ControlBarProps {
    data: ReconciliationData;
    onFinish: () => void;
}

export const ControlBar = ({ data, onFinish }: ControlBarProps) => {
    return (
        <div className="pt-20 w-full relative z-10">
            <div className="clay-surface bg-background/90 backdrop-blur-2xl border border-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_20px_80px_-15px_rgba(var(--primary),0.15)]">
                <div className="flex items-center gap-12 flex-1 w-full md:w-auto">
                    <div className="space-y-3 flex-1 max-w-xs">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-1">
                            <span className="text-primary flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                Review Progress
                            </span>
                            <span className="text-foreground">{data.progress}%</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden p-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.progress}%` }}
                                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-12 border-l border-border/50 pl-12 hidden xl:flex">
                        <div className="text-left space-y-0.5">
                            <p className="text-2xl font-black tracking-tighter">{data.unresolvedWarnings}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alerts</p>
                        </div>
                        <div className="text-left space-y-0.5">
                            <p className="text-2xl font-black tracking-tighter">{data.extraSections}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Orphans</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none h-14 px-8 border border-border/50 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-muted transition-all flex items-center justify-center gap-2">
                        <Undo2 className="w-4 h-4" />
                        Reset Selection
                    </button>
                    <button
                        onClick={onFinish}
                        className="flex-1 md:flex-none h-14 px-12 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative group overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Launch Final Generation
                            <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>
                </div>
            </div>
        </div>
    )
}

