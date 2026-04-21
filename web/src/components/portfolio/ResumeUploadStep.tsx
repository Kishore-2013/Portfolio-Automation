"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResumeUploadStepProps {
    onContinue: (file: File) => void
    onBack: () => void
}

export const ResumeUploadStep = ({ onContinue, onBack }: ResumeUploadStepProps) => {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile?.type === "application/pdf") {
            setFile(droppedFile)
        }
    }

    return (
        <div className="space-y-10 max-w-4xl mx-auto flex flex-col items-center">
            <div className="relative group text-center">
                <div className="absolute -inset-2 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <h2 className="relative text-3xl font-black uppercase tracking-tighter leading-none italic">
                    <span className="text-primary italic">02.</span> Neural Data Input
                </h2>
                <p className="mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40">High-Fidelity Information Extraction</p>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "clay-surface w-full min-h-[260px] flex flex-col items-center justify-center p-8 border border-primary/20 transition-all duration-700 relative overflow-hidden rounded-[2rem] group",
                    isDragging ? "bg-primary/10 border-primary scale-[1.02] shadow-[0_0_40px_rgba(theme(colors.primary),0.2)]" : "bg-muted/5 hover:border-primary/40",
                    file ? "bg-emerald-500/5 border-emerald-500/30" : ""
                )}
            >
                {/* Techy Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-0 pointer-events-none opacity-10 bg-[length:100%_4px]" />
                
                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative z-10 text-center space-y-6"
                        >
                            <div className="relative group/icon">
                                <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity animate-pulse" />
                                <div className="relative w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(theme(colors.primary),0.4)]">
                                    <Upload className="w-8 h-8" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black tracking-tight uppercase italic leading-none">Drop Resume Blueprint</p>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40">Neural Extraction Sandbox</p>
                            </div>
                            <label className="group relative clay-button px-10 py-3 bg-foreground text-background font-black text-[10px] uppercase tracking-[0.4em] cursor-pointer overflow-hidden transition-all rounded-xl">
                                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                                <span className="relative">Browse Filesystem</span>
                                <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            </label>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file-selected"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md space-y-6"
                        >
                            <div className="clay-surface bg-background p-6 flex items-center gap-6 relative shadow-2xl">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black truncate">{file.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.name.split('.').pop()?.toUpperCase()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="w-8 h-8 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="w-4 h-4" />
                                File ready for AI extraction
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -z-10" />
            </div>

            <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-muted/10 backdrop-blur-xl p-5 border border-border/50 rounded-[1.5rem] flex gap-4 hover:border-primary/40 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">Vault Security</p>
                        <p className="text-[9px] text-muted-foreground font-medium leading-tight opacity-60 line-clamp-2">High-fidelity parsing in an isolated sandbox environment. No data retention.</p>
                    </div>
                </div>
                <div className="bg-muted/10 backdrop-blur-xl p-5 border border-border/50 rounded-[1.5rem] flex gap-4 hover:border-primary/40 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">LLM Logic</p>
                        <p className="text-[9px] text-muted-foreground font-medium leading-tight opacity-60 line-clamp-2">Neural matching architecture transforms flat text into structured portfolio logic.</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full">
                <button
                    onClick={onBack}
                    className="flex-1 h-14 rounded-[1.25rem] border border-border font-black uppercase tracking-[0.4em] text-[9px] hover:bg-muted transition-all opacity-40 hover:opacity-100"
                >
                    Return
                </button>
                <button
                    disabled={!file}
                    onClick={() => {
                        if (file) {
                            onContinue(file)
                        }
                    }}
                    className="group relative flex-[2] h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_10px_30px_rgba(theme(colors.primary),0.2)] active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all rounded-[1.25rem] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-3">
                        Initialize Matching <Zap className="w-4 h-4 group-hover:animate-pulse" />
                    </span>
                </button>
            </div>
        </div>
    )
}

