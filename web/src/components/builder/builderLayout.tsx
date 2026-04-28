"use client"

import React, { useState } from "react"
import { 
    PanelLeftClose, PanelLeftOpen, Terminal as TerminalIcon, X, 
    ChevronDown, ChevronUp, Trash2, Files, Search, 
    Sparkles, Settings, Activity, Loader2, Code2, LayoutList
} from "lucide-react"
import { cn } from "@/lib/utils"
import FileExplorer from "./FileExplorer"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

const CodeEditor = dynamic(() => import("./CodeEditor"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#0b0b0e] border border-[#1c1c22]">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Loading Editor...</p>
        </div>
    )
})

const FormEditor = dynamic(() => import("./FormEditor"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#0b0b0e] border border-[#1c1c22]">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Loading Form...</p>
        </div>
    )
})

const PreviewPanel = dynamic(() => import("./PreviewPanel"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#0b0b0e]">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Preparing Preview...</p>
        </div>
    )
})

const SuggestionOverlay = dynamic(() => import("./SuggestionOverlay"), {
    ssr: false
})

export default function BuilderLayout() {
    const [explorerOpen, setExplorerOpen] = useState(true)
    const [consoleOpen, setConsoleOpen] = useState(false) // Default closed for cleaner look
    const [editorMode, setEditorMode] = useState<"form" | "code">("form")

    return (
        <div className="flex h-full w-full overflow-hidden bg-[#0b0b0e]">
            {/* ── Activity Bar (VS Code Style) ─────────────────────────── */}
            <div className="w-12 shrink-0 flex flex-col items-center py-4 bg-[#0d0d10] border-r border-[#1c1c22] z-40">
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => { setExplorerOpen(!explorerOpen) }}
                        className={cn("p-2 rounded-md transition-all", explorerOpen ? "text-indigo-500 bg-indigo-500/5" : "text-muted-foreground hover:text-foreground")}
                        title="File Explorer"
                    >
                        <Files className="w-5 h-5" />
                    </button>
                    
                    <button 
                        onClick={() => setEditorMode("form")}
                        className={cn("p-2 rounded-md transition-all", editorMode === "form" ? "text-indigo-500 bg-indigo-500/5" : "text-muted-foreground hover:text-foreground")}
                        title="Form Editor"
                    >
                        <LayoutList className="w-5 h-5" />
                    </button>
                    
                    <button 
                        onClick={() => setEditorMode("code")}
                        className={cn("p-2 rounded-md transition-all", editorMode === "code" ? "text-indigo-500 bg-indigo-500/5" : "text-muted-foreground hover:text-foreground")}
                        title="Code Editor"
                    >
                        <Code2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <button className="p-2 rounded-md text-muted-foreground/40 cursor-not-allowed">
                        <Activity className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-md text-muted-foreground/40 cursor-not-allowed">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ── File Explorer (collapsible) ───────────────────────────── */}
            <motion.div
                initial={false}
                animate={{ width: explorerOpen ? 260 : 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300, bounce: 0 }}
                className="shrink-0 overflow-hidden relative border-r border-[#1c1c22] bg-[#0d0d10]/50"
            >
                <div className="w-[260px] h-full flex flex-col">
                    <div className="h-10 flex items-center justify-between px-4 border-b border-[#1c1c22]">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Explorer</span>
                        <button onClick={() => setExplorerOpen(false)}>
                            <PanelLeftClose className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <FileExplorer />
                    </div>
                </div>
            </motion.div>

            {/* Explorer toggle floating button when closed */}
            {!explorerOpen && (
                <button
                    onClick={() => setExplorerOpen(true)}
                    className="absolute top-16 left-14 z-30 p-2 bg-[#1c1c22] border border-[#2a2a30] rounded-md text-white shadow-xl hover:bg-[#252530] transition-all"
                >
                    <PanelLeftOpen className="w-4 h-4" />
                </button>
            )}

            {/* ── Main Workspace ────────────────────────────────────────── */}
            <div className="flex-1 flex min-w-0 overflow-hidden relative">

                {/* ── Editor & Console Panel (Middle) ───────────────────────── */}
                <div className="flex-[1.2] min-w-0 flex flex-col overflow-hidden relative border-r border-[#1c1c22]">
                    <div className="flex-1 overflow-hidden shadow-2xl">
                        {editorMode === "code" ? <CodeEditor /> : <FormEditor />}
                    </div>

                    {/* VS Code Style Terminal / Console */}
                    <motion.div
                        initial={false}
                        animate={{ height: consoleOpen ? 240 : 36 }}
                        className="bg-[#0b0b0e] flex flex-col shrink-0 overflow-hidden border-t border-[#1c1c22]"
                    >
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between px-4 h-9 bg-[#0f0f12] border-b border-[#1c1c22] shrink-0">
                            <div className="flex items-center gap-6 h-full">
                                <button
                                    onClick={() => setConsoleOpen(true)}
                                    className={cn(
                                        "h-full flex items-center gap-2 px-1 transition-all",
                                        consoleOpen ? "border-b-2 border-indigo-500 text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <TerminalIcon className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Console</span>
                                </button>
                                <button className="h-full flex items-center gap-2 px-1 text-muted-foreground/40 cursor-not-allowed">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Output</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setConsoleOpen(!consoleOpen)}
                                    className="p-1.5 hover:bg-[#1c1c22] rounded text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {consoleOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                    onClick={() => setConsoleOpen(false)}
                                    className="p-1.5 hover:bg-[#1c1c22] rounded text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Actual Console Content */}
                        <div className="flex-1 overflow-hidden bg-[#0b0b0e] p-4 font-mono text-[11px] text-muted-foreground/60 leading-relaxed">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-indigo-500 font-bold">➜</span>
                                <span className="text-foreground">System initialized.</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-indigo-500 font-bold">➜</span>
                                <span>Preview runtime (Server 2) is active.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-indigo-500 font-bold">➜</span>
                                <span className="animate-pulse">_</span>
                            </div>
                            {/* Real-time terminal output from Server 2 will be piped here in future updates */}
                        </div>
                    </motion.div>
                </div>

                {/* ── Preview Panel (Right) ────────────────────────────────── */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#0d0d10]/30 backdrop-blur-sm">
                    <PreviewPanel />
                </div>
            </div>

            {/* Activities & Sidebar Handlers handled inside subcomponents */}
        </div>
    )
}

