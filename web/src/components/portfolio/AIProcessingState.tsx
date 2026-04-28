"use client"

import { motion } from "framer-motion"
import { Cpu, Terminal, Loader2, Binary, Activity, AlertTriangle, RefreshCcw, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIProcessingStateProps {
    isError?: boolean;
    error?: string | null;
    onRetry?: () => void;
    title?: string;
    subtitle?: string;
}

export const AIProcessingState = ({ 
    isError = false, 
    error = null, 
    onRetry,
    title,
    subtitle 
}: AIProcessingStateProps) => {
    return (
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center min-h-[500px] space-y-8 py-10 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 blur-[120px] rounded-full animate-pulse transition-colors duration-700",
                    isError ? "bg-amber-500/20" : "bg-primary/20"
                )} />
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[150px] rounded-full transition-colors duration-700",
                    isError ? "bg-amber-500/5" : "bg-primary/5"
                )} />
            </div>

            {/* Neural Pulse Core */}
            <div className="relative flex items-center justify-center">
                {/* Orbital Rings */}
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            rotate: i % 2 === 0 ? 360 : -360,
                            scale: [1, 1.05, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ 
                            rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                            default: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className={cn(
                            "absolute rounded-full border transition-colors duration-700",
                            isError ? "border-amber-500/20" : "border-primary/20"
                        )}
                        style={{ width: `${140 + i * 40}px`, height: `${140 + i * 40}px` }}
                    />
                ))}

                {/* The Core */}
                <div className={cn(
                    "relative w-32 h-32 rounded-full glassmorphism flex items-center justify-center border border-white/10 transition-all duration-700 group",
                    isError 
                        ? "shadow-[0_0_40px_rgba(245,158,11,0.3)] border-amber-500/40" 
                        : "shadow-[0_0_40px_rgba(theme(colors.primary),0.3)]"
                )}>
                    <div className={cn(
                        "absolute inset-0 rounded-full animate-ping",
                        isError ? "bg-amber-500/5" : "bg-primary/5"
                    )} />
                    <div className={cn(
                        "relative w-24 h-24 rounded-full bg-background border flex items-center justify-center overflow-hidden transition-colors duration-700",
                        isError ? "border-amber-500/40" : "border-primary/40"
                    )}>
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] opacity-20" />
                        
                        <motion.div
                            animate={isError ? { rotate: [0, -10, 10, 0] } : { scale: [1, 1.1, 1] }}
                            transition={isError ? { duration: 0.5, repeat: Infinity } : { duration: 2, repeat: Infinity }}
                        >
                            {isError ? (
                                <AlertTriangle className="w-12 h-12 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            ) : (
                                <Cpu className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(theme(colors.primary),0.5)]" />
                            )}
                        </motion.div>
                    </div>

                    {/* Orbiting Particles */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <div className={cn(
                            "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full transition-colors duration-700",
                            isError 
                                ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" 
                                : "bg-primary shadow-[0_0_10px_rgba(theme(colors.primary),0.8)]"
                        )} />
                    </motion.div>
                </div>

                {/* Activity Tags */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute -left-28 top-0 p-3 glassmorphism rounded-xl border border-white/5 flex items-center gap-3"
                >
                    <Binary className={cn("w-3.5 h-3.5", isError ? "text-amber-500" : "text-primary")} />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">V-Stream 2.0</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute -right-28 bottom-0 p-3 glassmorphism rounded-xl border border-white/5 flex items-center gap-3"
                >
                    <Activity className={cn("w-3.5 h-3.5", isError ? "text-amber-500" : "text-emerald-500")} />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">
                        {isError ? "Link Interrupted" : "Live Extraction"}
                    </span>
                </motion.div>
            </div>

            {/* Typography Section */}
            <div className="space-y-3 z-10">
                <div className="flex items-center justify-center gap-6 opacity-30">
                    <div className={cn("h-px w-8", isError ? "bg-amber-500" : "bg-primary")} />
                    <span className="text-[8px] font-black uppercase tracking-[0.8em]">
                        {isError ? "System Exception Detected" : "Neural Network Active"}
                    </span>
                    <div className={cn("h-px w-8", isError ? "bg-amber-500" : "bg-primary")} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                    {isError ? (
                        <>Assembly <span className="text-amber-500 italic">Interrupted.</span></>
                    ) : (
                        title || <>Assembling <span className="text-primary italic">Identity.</span></>
                    )}
                </h2>
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    {isError ? (
                        <span className="text-amber-500">Critical Error: Execution Terminated</span>
                    ) : (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            {subtitle || "Quantifying Professional Matrix"}
                        </>
                    )}
                </div>
            </div>

            {/* Modern Status Monitor */}
            <div className={cn(
                "w-full max-w-xl glassmorphism p-6 rounded-[2rem] border space-y-4 shadow-2xl transition-all duration-700",
                isError ? "border-amber-500/20 bg-amber-500/[0.02]" : "border-white/5"
            )}>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                        <Terminal className={cn("w-3.5 h-3.5", isError ? "text-amber-500" : "text-primary")} />
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Sys-Extraction Log [v1.4]</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isError ? "bg-amber-500" : "bg-emerald-500")} />
                        <span className={cn("text-[8px] font-black uppercase tracking-[0.2em]", isError ? "text-amber-500/60" : "text-emerald-500/60")}>
                            {isError ? "Link Lost" : "Secure Link"}
                        </span>
                    </div>
                </div>

                <div className="space-y-2 font-mono text-[9px] text-left">
                    {isError ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-amber-500/80">
                                <span className="opacity-30">❯</span>
                                <span className="uppercase italic tracking-wider">ERROR_CODE: SYS_500_CRIT</span>
                            </div>
                            <div className="flex gap-3 text-white/80 p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="opacity-30">❯</span>
                                <span className="uppercase tracking-widest leading-relaxed">
                                    {error || "An unexpected error occurred during the assembly phase. The blueprint repository may be unreachable or credentials expired."}
                                </span>
                            </div>
                            {onRetry && (
                                <button 
                                    onClick={onRetry}
                                    className="w-full mt-4 h-12 bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-3 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 group"
                                >
                                    <RefreshCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                                    Retry Assembly Flow
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 text-primary/80">
                                <span className="opacity-30">❯</span>
                                <span className="uppercase italic tracking-wider">Parsing PDF Buffer...</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/50">
                                <span className="opacity-30">❯</span>
                                <span className="uppercase italic tracking-wider">Mapping Neural Sections: PERSONAL_INFO, EXP_CORE</span>
                            </div>
                            <div className="flex items-center gap-3 text-primary">
                                <span className="opacity-30">❯</span>
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                <span className="uppercase italic tracking-widest font-bold">Refining Experience Blobs via LLM...</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Watermark */}
            <div className={cn(
                "absolute bottom-4 text-[120px] font-black uppercase italic tracking-tighter select-none pointer-events-none leading-none opacity-5 transition-colors duration-700",
                isError ? "text-amber-500" : "text-primary"
            )}>
                {isError ? "Failure" : "Neural"}
            </div>
        </div>
    )
}

