"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { RefreshCw, Monitor, Tablet, Smartphone, Maximize, Minimize, Loader2, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFileStore } from "./fileStore"

type Viewport = "desktop" | "tablet" | "mobile"

// How long (ms) we wait after an iframe load-error before showing the
// "reconnecting" overlay and attempting an auto-restart.
const IFRAME_ERROR_DEBOUNCE_MS = 2_000

export default function PreviewPanel() {
    const previewUrl        = useFileStore(s => s.previewUrl)
    const isPreviewLoading  = useFileStore(s => s.isPreviewLoading)
    const previewRefreshKey = useFileStore(s => s.previewRefreshKey)
    const previewError      = useFileStore(s => s.previewError)
    const startPreview      = useFileStore(s => s.startPreview)

    const [viewport, setViewport]           = useState<Viewport>("desktop")
    const [isFullscreen, setIsFullscreen]   = useState(false)
    const [iframeError, setIframeError]     = useState(false)
    const [isReconnecting, setIsReconnecting] = useState(false)

    const panelRef          = useRef<HTMLDivElement>(null)
    const iframeRef         = useRef<HTMLIFrameElement>(null)
    const errorTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ─── Refresh on save (previewRefreshKey bump) ────────────────────────────
    // For Vite dev servers, reload the contentWindow directly — appending ?t=
    // to a Vite root route causes it to serve 404 in some templates.
    useEffect(() => {
        if (previewRefreshKey > 0 && iframeRef.current && previewUrl) {
            try {
                // Try soft reload via contentWindow (same-origin when Vite is
                // on the same host; falls back to src reassignment otherwise)
                if (iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.location.reload()
                } else {
                    // Cross-origin fallback: bump the src without a cache-buster
                    // to avoid Vite treating /?t=... as an unknown route
                    iframeRef.current.src = previewUrl
                }
            } catch {
                // SecurityError from cross-origin frames — reassign src
                iframeRef.current.src = previewUrl
            }
            setIframeError(false)
        }
    }, [previewRefreshKey, previewUrl])

    // ─── Clear iframe error state when previewUrl changes ───────────────────
    useEffect(() => {
        setIframeError(false)
        setIsReconnecting(false)
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }, [previewUrl])

    // ─── Handle iframe load error (net::ERR_CONNECTION_REFUSED etc.) ────────
    const handleIframeError = useCallback(() => {
        // Debounce: some browsers fire error spuriously during initial load
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
        errorTimerRef.current = setTimeout(() => {
            // Only act if we still have a previewUrl (i.e. server thought it was live)
            if (!useFileStore.getState().previewUrl) return
            console.warn("[PreviewPanel] iframe load error — server may have crashed")
            setIframeError(true)
            setIsReconnecting(true)
            // Trigger auto-restart via the store (same path as heartbeat)
            useFileStore.getState().startPreview()
        }, IFRAME_ERROR_DEBOUNCE_MS)
    }, [])

    // ─── When store clears isPreviewLoading, reset reconnecting state ────────
    useEffect(() => {
        if (!isPreviewLoading) setIsReconnecting(false)
    }, [isPreviewLoading])

    // ─── Manual refresh button ────────────────────────────────────────────────
    const handleRefresh = () => {
        if (previewError || iframeError) {
            setIframeError(false)
            startPreview()
            return
        }
        if (iframeRef.current) {
            try {
                iframeRef.current.contentWindow?.location.reload()
            } catch {
                iframeRef.current.src = iframeRef.current.src
            }
        }
    }

    // ─── Fullscreen ──────────────────────────────────────────────────────────
    const toggleFullscreen = () => {
        if (!panelRef.current) return
        if (!document.fullscreenElement) {
            panelRef.current.requestFullscreen().catch(() => { /* ignore */ })
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

    // ─── Cleanup error timer on unmount ──────────────────────────────────────
    useEffect(() => {
        return () => {
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
        }
    }, [])

    // Derive a single "is something loading or reconnecting" flag
    const showLoadingOverlay = isPreviewLoading || isReconnecting

    return (
        <div ref={panelRef} className="h-full flex flex-col bg-[#0b0b0e]">
            {/* ─── Sub-header ─────────────────────────────────────────────── */}
            <div className="h-10 shrink-0 flex items-center justify-between px-3 bg-[#111115] border-b border-[#1c1c22]">
                {/* Viewport toggles */}
                <div className="flex items-center gap-0.5 bg-[#16161a] p-1 rounded-md border border-[#1c1c22] shadow-inner">
                    {(["desktop", "tablet", "mobile"] as Viewport[]).map(vp => {
                        const Icon = vp === "desktop" ? Monitor : vp === "tablet" ? Tablet : Smartphone
                        return (
                            <button
                                key={vp}
                                onClick={() => setViewport(vp)}
                                className={cn(
                                    "p-1.5 rounded transition-all",
                                    viewport === vp
                                        ? "bg-indigo-600 text-white"
                                        : "text-muted-foreground/60 hover:text-foreground hover:bg-[#1c1c22]"
                                )}
                                title={`${vp.charAt(0).toUpperCase() + vp.slice(1)} View`}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        )
                    })}
                </div>

                {/* Status badge */}
                <div className="hidden sm:flex items-center h-full">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded bg-[#16161a] border border-[#1c1c22] text-[9px] font-black uppercase tracking-widest",
                        previewUrl && !iframeError ? "text-green-400" :
                        isReconnecting ? "text-amber-400" :
                        "text-indigo-400"
                    )}>
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            previewUrl && !iframeError ? "bg-green-400 animate-pulse" :
                            isReconnecting ? "bg-amber-400 animate-pulse" :
                            "bg-indigo-400"
                        )} />
                        {previewUrl && !iframeError
                            ? "LIVE"
                            : isReconnecting
                                ? "RECONNECTING"
                                : showLoadingOverlay
                                    ? "STARTING..."
                                    : "IDLE"
                        }
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => useFileStore.getState().rebuildEnvironment()}
                        className="p-1.5 rounded text-indigo-400 hover:text-indigo-300 hover:bg-[#1c1c22] transition-all"
                        title="Re-sync Environment (Full Rebuild)"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-[#1c1c22] transition-all"
                        title="Refresh Preview"
                    >
                        <RefreshCw className="w-3.5 h-3.5 rotate-90" />
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

            {/* ─── Preview container ───────────────────────────────────────── */}
            <div className="flex-1 bg-[#16161a] overflow-auto flex items-start justify-center p-4 min-h-0 relative">

                {/* Loading / Reconnecting overlay */}
                {showLoadingOverlay && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0b0e]/80 backdrop-blur-sm">
                        {isReconnecting ? (
                            <>
                                <div className="relative mb-4">
                                    <WifiOff className="w-8 h-8 text-amber-500/40" />
                                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute -bottom-1 -right-1" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                                    Reconnecting...
                                </p>
                                <p className="text-[9px] text-muted-foreground/40 mt-1 italic">
                                    Server dropped — auto-restarting your preview
                                </p>
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    Initializing Environment...
                                </p>
                                <p className="text-[9px] text-muted-foreground/40 mt-1 italic">
                                    Our engine is spinning up your portfolio
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Idle / no URL */}
                {!previewUrl && !showLoadingOverlay && !previewError && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[#1c1c22] flex items-center justify-center mb-4">
                            <Monitor className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Preview Unavailable
                        </p>
                    </div>
                )}

                {/* Error state */}
                {previewError && !isReconnecting && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-[#0b0b0e]">
                        <div className="w-20 h-20 rounded-[2rem] bg-red-500/5 flex items-center justify-center mb-6 border border-red-500/10">
                            <Monitor className="w-10 h-10 text-red-500/30" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-red-400 mb-3 italic">
                            Runtime Connection Failed
                        </h3>
                        <p className="max-w-xs text-[10px] text-muted-foreground/60 leading-relaxed mb-6 uppercase tracking-wider font-bold">
                            The portfolio runtime environment encountered a synchronization delay.
                            This usually happens during heavy dependency installation.
                        </p>
                        <div className="w-full max-w-sm bg-[#16161a] p-4 rounded-2xl border border-white/5 font-mono text-[9px] text-red-400/80 break-words mb-8 text-left shadow-2xl">
                            <span className="text-muted-foreground/40 mr-2">LOG_ERR:</span>
                            {previewError}
                        </div>
                        <div className="flex flex-col gap-3 w-full max-w-[200px]">
                            <button
                                onClick={() => useFileStore.getState().rebuildEnvironment()}
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

                {/* Live iframe */}
                {previewUrl && !iframeError && (
                    <div
                        className="bg-white shadow-2xl transition-all duration-300 ease-in-out h-full"
                        style={{
                            width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px",
                            maxHeight: "100%",
                            borderRadius: viewport === "desktop" ? "0px" : "12px",
                            overflow: "hidden",
                        }}
                    >
                        <iframe
                            key={previewUrl}
                            ref={iframeRef}
                            src={previewUrl}
                            className="w-full h-full border-none"
                            title="Portfolio Preview"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            allow="clipboard-write"
                            onError={handleIframeError}
                            onLoad={() => {
                                // Clear any pending error timer on successful load
                                if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
                                setIframeError(false)
                                setIsReconnecting(false)
                            }}
                        />
                    </div>
                )}

                {/* iframe-error reconnecting placeholder (shows while startPreview re-runs) */}
                {previewUrl && iframeError && !isPreviewLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0b0e]/90 backdrop-blur-sm">
                        <div className="relative mb-4">
                            <WifiOff className="w-10 h-10 text-amber-500/30" />
                            <Loader2 className="w-5 h-5 text-amber-400 animate-spin absolute -bottom-1 -right-1" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1">
                            Connection Lost
                        </p>
                        <p className="text-[9px] text-muted-foreground/50 italic mb-6">
                            Preview server stopped responding — restarting...
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            Retry Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
