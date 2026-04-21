"use client"

import React from "react"
import { useFileStore } from "./fileStore"
import { Check, X, Sparkles, Wand2, Eye, Split, FileCode } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function SuggestionOverlay() {
    const suggestedChanges = useFileStore(s => s.suggestedChanges)
    const acceptSuggestions = useFileStore(s => s.acceptSuggestions)
    const rejectSuggestions = useFileStore(s => s.rejectSuggestions)
    const activeFile = useFileStore(s => s.activeFile)
    const setActiveFile = useFileStore(s => s.setActiveFile)

    if (!suggestedChanges) return null

    const isCurrentFile = suggestedChanges.filePath === activeFile

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={cn(
                    "w-full px-4 pt-4 z-50 pointer-events-none absolute left-0 top-0",
                    !isCurrentFile && "translate-y-4"
                )}
            >
                <div className={cn(
                    "mx-auto backdrop-blur-xl border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3 pointer-events-auto overflow-hidden relative transition-all duration-300 max-w-[700px]",
                    isCurrentFile 
                        ? "bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/20" 
                        : "bg-[#1c1c22]/95 border-amber-500/30"
                )}>
                    {/* Interior Glow for "Active File" mode */}
                    {isCurrentFile && (
                        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />
                    )}
                    
                    <div className="flex items-center justify-between gap-4 relative z-10">
                        {/* Left Side: Context */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all shadow-inner",
                                isCurrentFile ? "bg-indigo-600 shadow-indigo-500/40 text-white border-indigo-400" : "bg-amber-600/20 text-amber-500 border-amber-500/20"
                            )}>
                                <Sparkles className={cn("w-5 h-5", isCurrentFile ? "animate-spin-slow" : "animate-pulse")} />
                            </div>
                            
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none">
                                        {isCurrentFile ? "AI Enhancement Proposed" : "Template Update Ready"}
                                    </h3>
                                    <div className="h-1 w-1 rounded-full bg-white/20" />
                                    <span className="text-[9px] text-indigo-400 font-bold font-mono">
                                        {isCurrentFile ? "Inline Mode" : "Pending Merge"}
                                    </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium italic">
                                    {isCurrentFile 
                                        ? "GPT-4o suggests improving this component's content." 
                                        : `Found relevant data for ${suggestedChanges.filePath.split('/').pop()}`
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {!isCurrentFile && (
                                <button
                                    onClick={() => setActiveFile(suggestedChanges.filePath)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-tighter text-white transition-all border border-white/5 shadow-sm"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    Jump to File
                                </button>
                            )}

                            <button
                                onClick={rejectSuggestions}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/5 hover:bg-red-500/20 text-red-500 transition-all border border-red-500/10 shadow-sm"
                                title="Discard Changes"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <button
                                onClick={acceptSuggestions}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-[0_10px_20px_rgba(79,70,229,0.3)] group relative overflow-hidden border border-indigo-400/30"
                            >
                                <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                {isCurrentFile ? "Apply" : "Apply All"}
                                
                                <motion.div 
                                    animate={{ left: ["-100%", "200%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-y-0 w-20 bg-white/30 skew-x-12 blur-md"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

