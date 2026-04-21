"use client"

import React, { useRef, useState, useEffect } from "react"
import { RefreshCw, Monitor, Tablet, Smartphone, Maximize, Minimize, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFileStore } from "./fileStore"

export default function PreviewPanel() {
    const previewUrl = useFileStore(s => s.previewUrl)
    const isPreviewLoading = useFileStore(s => s.isPreviewLoading)
    const previewRefreshKey = useFileStore(s => s.previewRefreshKey)
    const previewError = useFileStore(s => s.previewError)
    const startPreview = useFileStore(s => s.startPreview)
    const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
    const [isFullscreen, setIsFullscreen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    // Automatically Refresh Iframe on Save
    useEffect(() => {
        if (previewRefreshKey > 0 && iframeRef.current && previewUrl) {
            const url = new URL(previewUrl)
            url.searchParams.set("t", Date.now().toString())
            iframeRef.current.src = url.toString()
        }
    }, [previewRefreshKey, previewUrl])

    const handleRefresh = () => {
        if (previewError) {
            startPreview()
            return
        }
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src
        }
    }

    const toggleFullscreen = () => {
        if (!panelRef.current) return
        if (!document.fullscreenElement) {
            panelRef.current.requestFullscreen().catch(() => {
                // Ignore FS failure
            })
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener("fullscreenchange", handleFsChange)
        return () => document.removeEventListener("fullscreenchange", handleFsChange)
    }, [])

    return (
        <div ref={panelRef} className="h-full flex flex-col bg-[#0b0b0e]">
            {/* Sub-header */}
            <div className="h-10 shrink-0 flex items-center justify-between px-3 bg-[#111115] border-b border-[#1c1c22]">
                {/* Viewport Toggles */}
                <div className="flex items-center gap-0.5 bg-[#16161a] p-1 rounded-md border border-[#1c1c22] shadow-inner">
                    <button
                        onClick={() => setViewport("desktop")}
                        className={cn(
                            "p-1.5 rounded transition-all",
                            viewport === "desktop" ? "bg-indigo-600 text-white" : "text-muted-foreground/60 hover:text-foreground hover:bg-[#1c1c22]"
                        )}
                        title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewport("tablet")}
                        className={cn(
                            "p-1.5 rounded transition-all",
                            viewport === "tablet" ? "bg-indigo-600 text-white" : "text-muted-foreground/60 hover:text-foreground hover:bg-[#1c1c22]"
                        )}
                        title="Tablet View"
                    >
                        <Tablet className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewport("mobile")}
                        className={cn(
                            "p-1.5 rounded transition-all",
                            viewport === "mobile" ? "bg-indigo-600 text-white" : "text-muted-foreground/60 hover:text-foreground hover:bg-[#1c1c22]"
                        )}
                        title="Mobile View"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>

                {/* Status badge */}
                <div className="hidden sm:flex items-center h-full">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded bg-[#16161a] border border-[#1c1c22] text-[9px] font-black uppercase tracking-widest",
                        previewUrl ? "text-green-400" : "text-indigo-400"
                    )}>
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            previewUrl ? "bg-green-400 animate-pulse" : "bg-indigo-400"
                        )} />
                        {previewUrl ? "LIVE" : isPreviewLoading ? "STARTING..." : "IDLE"}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-[#1c1c22] transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-[#1c1c22] transition-all"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
                    >
                        {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Preview iframe Container */}
            <div className="flex-1 bg-[#16161a] overflow-auto flex items-start justify-center p-4 min-h-0 relative">
                {isPreviewLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0b0e]/80 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing Environment...</p>
                        <p className="text-[9px] text-muted-foreground/40 mt-1 italic">Server 2 is spinning up your portfolio</p>
                    </div>
                )}

                {!previewUrl && !isPreviewLoading && !previewError && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[#1c1c22] flex items-center justify-center mb-4">
                            <Monitor className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Preview Unavailable</p>
                    </div>
                )}

                {previewError && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-[#0b0b0e]">
                        <div className="w-20 h-20 rounded-[2rem] bg-red-500/5 flex items-center justify-center mb-6 border border-red-500/10">
                            <Monitor className="w-10 h-10 text-red-500/30" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-red-400 mb-3 italic">Runtime Connection Failed</h3>
                        <p className="max-w-xs text-[10px] text-muted-foreground/60 leading-relaxed mb-6 uppercase tracking-wider font-bold">
                            The portfolio runtime environment encountered a synchronization delay. This usually happens during heavy dependency installation.
                        </p>
                        <div className="w-full max-w-sm bg-[#16161a] p-4 rounded-2xl border border-white/5 font-mono text-[9px] text-red-400/80 break-words mb-8 text-left shadow-2xl">
                            <span className="text-muted-foreground/40 mr-2">LOG_ERR:</span>
                            {previewError}
                        </div>
                        <div className="flex flex-col gap-3 w-full max-w-[200px]">
                            <button 
                                onClick={() => startPreview()}
                                className="h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                            >
                                Re-sync Environment
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="h-11 bg-[#1c1c22] hover:bg-[#2a2a30] text-muted-foreground hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                            >
                                Force Reload Interface
                            </button>
                        </div>
                    </div>
                )}

                {previewUrl && (
                    <div 
                        className="bg-white shadow-2xl transition-all duration-300 ease-in-out h-full w-full"
                        style={{ 
                            width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px",
                            maxHeight: "100%",
                            borderRadius: viewport === "desktop" ? "0px" : "12px",
                            overflow: "hidden"
                        }}
                    >
                        <iframe
                            key={previewUrl}
                            ref={iframeRef}
                            src={previewUrl}
                            className="w-full h-full border-none"
                            title="Portfolio Preview"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

