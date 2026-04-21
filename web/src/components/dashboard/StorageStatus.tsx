"use client"

import { useEffect, useState } from "react"
import { projectService } from "@/services/project.service"
import { AlertCircle, HardDrive, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function StorageStatus() {
    const [status, setStatus] = useState<{ free: number; total: number; used: number; path: string; isFull: boolean } | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const checkStorage = async () => {
            try {
                const result = await projectService.getStorageStatus()
                
                if (result && typeof result === 'object' && 'free' in result) {
                    const typedResult = result as { free: number; total: number; used: number; path: string; isFull: boolean }
                    setStatus(typedResult)
                    
                    const freeSpace = Number(typedResult.free) || 0
                    const isFull = !!typedResult.isFull
                    
                    if (isFull || freeSpace < 2 * 1024 * 1024 * 1024) {
                        setIsVisible(true)
                    } else {
                        setIsVisible(false)
                    }
                } else {
                    setIsVisible(false)
                }
            } catch (err) {
                setIsVisible(false)
            }
        }
        checkStorage()
        const interval = setInterval(checkStorage, 30000)
        return () => clearInterval(interval)
    }, [])

    if (!status || !isVisible) return null

    const f = status.free || 0
    const t = status.total || 1
    const u = status.used || 0
    const p = status.path || "C:/"
    const full = !!status.isFull

    const freeGB = (f / (1024 * 1024 * 1024)).toFixed(2)
    const totalGB = (t / (1024 * 1024 * 1024)).toFixed(2)
    const usedPercent = ((u / t) * 100).toFixed(1)

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full mb-8 relative"
            >
                <div className={`clay-surface p-6 overflow-hidden border-2 ${full ? 'border-red-500/50 bg-red-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className={`p-4 rounded-2xl ${full ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                            <HardDrive className="w-8 h-8 animate-pulse" />
                        </div>
                        
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h3 className="text-xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
                                {full ? "DISK SPACE CRITICALLY LOW" : "Storage Running Low"}
                                <AlertCircle className="w-5 h-5" />
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground max-w-2xl">
                                Your instance storage at <code className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">"{p}"</code> has only <span className="text-foreground font-black">{freeGB}GB</span> free. 
                                This may cause build failures and app crashes.
                            </p>
                            
                            <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden mt-4 border border-border/50">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${usedPercent}%` }}
                                    className={`h-full ${full ? 'bg-red-500' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-1">
                                <span>{usedPercent}% Used</span>
                                <span>{totalGB}GB Total</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                                className="clay-button px-6 py-3 bg-foreground text-background font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                                Free Up Space
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

