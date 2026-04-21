"use client"

import React, { useEffect } from "react"
import { useFileStore } from "./fileStore"
import BuilderLayout from "./builderLayout"
import { useRouter, useSearchParams } from "next/navigation"
import {
    ArrowLeft, Globe, Download, Share2, Rocket, Settings, Wifi, Loader2, ChevronDown, Monitor, Code
} from "lucide-react"
import { projectService } from "@/services/project.service"
import { useSnackbar } from "notistack"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

function TopNav() {
    const router = useRouter()
    const [isFullscreen, setIsFullscreen] = React.useState(false)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }

    const currentInstanceId = useFileStore(s => s.currentInstanceId)
    const { enqueueSnackbar } = useSnackbar()
    const [isOpeningVSCode, setIsOpeningVSCode] = React.useState(false)

    const handleOpenVSCode = async () => {
        if (!currentInstanceId) return
        try {
            setIsOpeningVSCode(true)
            const id = parseInt(currentInstanceId)
            const diskPath = await projectService.getDiskPath(id)
            window.location.href = `vscode://file/${diskPath}`
            enqueueSnackbar("Launching VS Code...", { variant: "info" })
        } catch (err) {
            enqueueSnackbar("Failed to locate local instance files.", { variant: "error" })
        } finally {
            setIsOpeningVSCode(false)
        }
    }

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", handleFsChange)
        return () => document.removeEventListener("fullscreenchange", handleFsChange)
    }, [])

    return (
        <header className="h-12 shrink-0 flex items-center justify-between px-4 bg-[#0d0d10] border-b border-[#1c1c22] z-50 select-none shadow-xl">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 hover:bg-[#1c1c22] rounded-md text-muted-foreground hover:text-foreground transition-all duration-200"
                    title="Go back"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="h-4 w-[1px] bg-[#1c1c22]" />
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 rotate-3">
                        <Rocket className="text-white w-4 h-4 -rotate-3" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground tracking-tight leading-none mb-0.5">
                            Portfolio.ai Builder
                        </span>
                        <span className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-[0.15em] leading-none">
                            Classic Workspace • v1.4
                        </span>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-[#16161a] rounded-full border border-[#1c1c22] shadow-inner">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Synchronized
                    </span>
                </div>
                <div className="w-[1px] h-3 bg-[#1c1c22]" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    Build Mode
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#16161a] p-1 rounded-lg border border-[#1c1c22]">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-3 py-1 hover:bg-[#1c1c22] rounded-md text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-all">
                                <Monitor className="w-3.5 h-3.5" />
                                {isOpeningVSCode ? "Locating..." : "IDE"}
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 p-2 rounded-xl bg-[#0d0d10]/95 backdrop-blur-xl border-[#1c1c22] shadow-2xl" align="end" sideOffset={10}>
                            <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 px-2 py-1.5 text-white">Switch Environment</DropdownMenuLabel>
                            <DropdownMenuItem 
                                onSelect={() => {}} 
                                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer bg-indigo-500/10 text-indigo-400"
                            >
                                <Monitor className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Antigravity (Active)</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#1c1c22] my-1" />
                            <DropdownMenuItem 
                                onClick={handleOpenVSCode}
                                disabled={isOpeningVSCode}
                                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors"
                            >
                                <Code className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">VS Code</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 hover:bg-[#1c1c22] rounded-md text-muted-foreground hover:text-foreground transition-all duration-200"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-[#1c1c22] rounded-md text-muted-foreground hover:text-foreground transition-all duration-200">
                        <Share2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#1c1c22] text-muted-foreground hover:text-white border border-[#2a2a30] hover:border-[#3a3a45] transition-all">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/25 border border-indigo-500/50">
                        <Globe className="w-3.5 h-3.5" />
                        Publish Site
                    </button>
                </div>
            </div>
        </header>
    )
}

function StatusBar() {
    const activeFile = useFileStore(s => s.activeFile)
    const previewUrl = useFileStore(s => s.previewUrl)
    const isSaving = useFileStore(s => s.isSaving)

    const lang = activeFile ? (() => {
        const ext = activeFile.split(".").pop()?.toLowerCase() ?? ""
        return ({ 
            js: "JavaScript", 
            jsx: "JavaScript (React)", 
            ts: "TypeScript", 
            tsx: "TypeScript (React)", 
            css: "CSS", 
            html: "HTML", 
            json: "JSON" 
        } as any)[ext] ?? "Plain Text"
    })() : ""

    return (
        <div className="h-7 shrink-0 flex items-center justify-between px-3 bg-[#0d0d10] border-t border-[#1c1c22] text-[9px] font-bold uppercase tracking-widest select-none z-50 text-muted-foreground/60">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-[#16161a] border border-[#1c1c22]">
                    <div className={`w-1.5 h-1.5 rounded-full ${previewUrl ? "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]" : "bg-yellow-500 animate-pulse"}`} />
                    <span className="text-muted-foreground">{previewUrl ? "Systems Ready" : "Initializing"}</span>
                </div>
                {isSaving && (
                    <div className="flex items-center gap-2 text-amber-500 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Saving Changes...</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3" />
                    <span>WebSocket: Connected</span>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <button
                    onClick={() => useFileStore.getState().forceRefresh()}
                    className="px-2 py-0.5 rounded border border-[#1c1c22] hover:bg-[#1c1c22] transition-colors"
                >
                    Hard Reset Preview
                </button>
                {activeFile && (
                    <div className="flex items-center gap-3">
                        <span className="text-indigo-400/80">{activeFile}</span>
                        <div className="w-[1px] h-3 bg-[#1c1c22]" />
                        <span>{lang}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-indigo-500/50">
                    <Globe className="w-3 h-3" />
                    <span>Region: US-East</span>
                </div>
            </div>
        </div>
    )
}

export default function Builder() {
    const router = useRouter()
    const currentInstanceId = useFileStore(s => s.currentInstanceId)
    const instances = useFileStore(s => s.instances)
    const projectFiles = useFileStore(s => s.projectFiles)
    const startPreview = useFileStore(s => s.startPreview)
    const stopPreview = useFileStore(s => s.stopPreview)
    const setCurrentInstance = useFileStore(s => s.setCurrentInstance)
    const loadError = useFileStore(s => s.loadError)

    const currentInstance = currentInstanceId ? instances[currentInstanceId] : null
    const hasFiles = Object.keys(projectFiles).length > 0

    const searchParams = useSearchParams()
    const urlProjectId = searchParams.get("projectId")

    useEffect(() => {
        // 1. URL Sensing: If we have a projectId in URL but it's not the current one, switch.
        // This handles both initial load and manual URL changes.
        if (urlProjectId && urlProjectId !== currentInstanceId) {
            setCurrentInstance(urlProjectId)
        }
    }, [urlProjectId, currentInstanceId, setCurrentInstance])

    useEffect(() => {
        if (!currentInstanceId) return

        let mounted = true;

        const init = async () => {
            const state = useFileStore.getState()
            const currentInst = state.instances[currentInstanceId]
            const hasProjectFiles = Object.keys(state.projectFiles).length > 0

            // 2. Persistence recovery (Redis-backed)
            if (!currentInst || !hasProjectFiles) {
                await setCurrentInstance(currentInstanceId)
            }
            
            if (mounted && !useFileStore.getState().loadError) {
                // Data is here, start the preview
                startPreview()
            }
        }
        
        init()
        
        // CLEANUP: Stop preview on unmount to free up Server 2 pool
        return () => {
            mounted = false
            stopPreview()
        }
    }, [currentInstanceId, setCurrentInstance, startPreview, stopPreview])

    if (loadError) {
        return (
            <div className="h-screen w-screen bg-[#0b0b0e] flex flex-col items-center justify-center gap-6 p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                    <Rocket className="w-10 h-10 text-red-500/40" />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-red-400">Workspace Error</p>
                    <p className="max-w-md text-[11px] text-muted-foreground bg-[#16161a] p-4 rounded-xl border border-red-500/20 font-mono italic">
                        {loadError}
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => setCurrentInstance(currentInstanceId!)}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Retry Loading
                    </button>
                    <button 
                        onClick={() => router.push('/dashboard/portfolios')}
                        className="px-6 py-2.5 bg-[#1c1c22] hover:bg-[#2a2a30] text-muted-foreground hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Back to Portfolios
                    </button>
                </div>
            </div>
        )
    }

    if (!currentInstanceId) {
        return (
            <div className="h-screen w-screen bg-[#0b0b0e] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <Rocket className="text-white w-5 h-5" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-widest text-white">No project loaded</p>
                <p className="text-xs text-muted-foreground/50">Go back and create a portfolio first</p>
            </div>
        )
    }

    // If we have ID but still fetching data
    if (!currentInstance || !hasFiles) {
        return (
            <div className="h-screen w-screen bg-[#0b0b0e] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Resuming Session...</p>
                <p className="text-[10px] text-muted-foreground/50 italic">Pulling your latest changes from the cloud</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-[#0b0b0e] overflow-hidden">
            <TopNav />
            <div className="flex-1 min-h-0 overflow-hidden">
                <BuilderLayout />
            </div>
            <StatusBar />
        </div>
    )
}

