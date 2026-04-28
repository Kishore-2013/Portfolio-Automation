"use client"

import React, { useRef, useEffect, useCallback, useState } from "react"
import { Editor, DiffEditor } from "@monaco-editor/react"
import { useFileStore } from "./fileStore"
import { Save, FileCode2, Split, Wand2, Sparkles, Loader2 } from "lucide-react"
import SuggestionOverlay from "./SuggestionOverlay"
import { cn } from "@/lib/utils"

export default function CodeEditor() {
    const activeFile = useFileStore(s => s.activeFile)
    const projectFiles = useFileStore(s => s.projectFiles)
    const editorBuffers = useFileStore(s => s.editorBuffers)
    const setEditorBuffer = useFileStore(s => s.setEditorBuffer)
    const saveFile = useFileStore(s => s.saveFile)
    const isSaving = useFileStore(s => s.isSaving)
    const suggestedChanges = useFileStore(s => s.suggestedChanges)

    const editorRef = useRef<any>(null)
    const [viewMode, setViewMode] = useState<"edit" | "diff">("edit")
    const lastTypedValue = useRef<string | null>(null)

    const currentValue = editorBuffers[activeFile] ?? projectFiles[activeFile]?.code ?? ""
    const originalValue = projectFiles[activeFile]?.code ?? ""
    const hasUnsaved = editorBuffers[activeFile] !== undefined

    const hasSuggestionForThisFile = suggestedChanges?.filePath === activeFile
    const proposedValue = suggestedChanges?.proposedCode ?? ""

    // Automatically reset mode when changing files
    useEffect(() => {
        setViewMode("edit")
    }, [activeFile])

    // Push external changes (e.g. from backend or AI sync) into the editor
    // but ONLY if the editor doesn't have local dirty changes.
    useEffect(() => {
        if (!editorRef.current || !activeFile) return
        if (editorBuffers[activeFile] !== undefined) return

        const savedContent = projectFiles[activeFile]?.code ?? ""
        const model = editorRef.current.getModel?.()
        if (model && model.getValue() !== savedContent) {
            editorRef.current.setValue(savedContent)
        }
    }, [activeFile, projectFiles]) // Don't depend on editorBuffers here!

    // Global Ctrl+S
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault()
                const { activeFile, editorBuffers } = useFileStore.getState()
                if (editorBuffers[activeFile] !== undefined) {
                    useFileStore.getState().saveFile(activeFile)
                }
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    const handleChange = useCallback((val: string | undefined) => {
        if (val === undefined || viewMode !== "edit") return
        lastTypedValue.current = val
        
        // Use a small timeout to avoid hammering the store
        const timeoutId = setTimeout(() => {
            if (lastTypedValue.current === val) {
                setEditorBuffer(activeFile, val)
            }
        }, 150)
        return () => clearTimeout(timeoutId)
    }, [activeFile, setEditorBuffer, viewMode])

    const handleMount = useCallback((editor: any) => {
        editorRef.current = editor
    }, [])

    const breadcrumb = activeFile ? `/${activeFile}` : "No file"

    return (
        <div className="h-full flex flex-col bg-[#0b0b0e] relative overflow-hidden">
            {/* AI Review Header (Cursor Style) */}
            {hasSuggestionForThisFile && (
                <div className="h-10 shrink-0 bg-indigo-600/10 border-b border-indigo-500/30 flex items-center justify-between px-4 z-20">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                            AI Diff Mode Passive
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === "diff" ? "edit" : "diff")}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase transition-all border",
                                viewMode === "diff"
                                    ? "bg-indigo-500 text-white border-indigo-400"
                                    : "bg-transparent text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
                            )}
                        >
                            <Split className="w-3 h-3" />
                            {viewMode === "diff" ? "Close Diff" : "Preview Diff"}
                        </button>
                    </div>
                </div>
            )}

            {/* Editor Primary Header */}
            <div className="h-9 shrink-0 flex items-center justify-between bg-[#0f0f12] border-b border-[#1c1c22] px-0 z-10 shadow-md">
                <div className="flex items-center h-full">
                    <div className={cn(
                        "flex items-center gap-2 h-full px-4 border-r border-[#1c1c22] text-xs font-mono transition-colors",
                        activeFile ? "bg-[#0b0b0e] text-foreground border-t-2 border-t-indigo-500" : "text-muted-foreground"
                    )}>
                        {activeFile && <FileCode2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        <span className="truncate max-w-[280px]">{breadcrumb}</span>
                        {hasUnsaved && (
                            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 pr-3">
                    <button
                        onClick={() => saveFile(activeFile)}
                        disabled={!hasUnsaved || isSaving}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all",
                            hasUnsaved
                                ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 cursor-pointer shadow-lg shadow-indigo-600/10"
                                : "text-muted-foreground/30 cursor-not-allowed",
                            isSaving && "opacity-70"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Save className="w-3 h-3" />
                        )}
                        {isSaving ? "Saving..." : hasUnsaved ? "Save All" : "Saved"}
                    </button>
                </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
                {activeFile ? (
                    viewMode === "diff" && hasSuggestionForThisFile ? (
                        <DiffEditor
                            height="100%"
                            theme="vs-dark"
                            language={inferLang(activeFile)}
                            original={originalValue}
                            modified={proposedValue}
                            options={{
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                renderSideBySide: true,
                                readOnly: true,
                            }}
                        />
                    ) : (
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={inferLang(activeFile)}
                            key={activeFile}
                            defaultValue={currentValue}
                            onChange={handleChange}
                            onMount={handleMount}
                            options={{
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: "on",
                                tabSize: 2,
                                lineNumbers: "on",
                                renderLineHighlight: "line",
                                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                                padding: { top: 10 }
                            }}
                        />
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <FileCode2 className="w-10 h-10 opacity-20" />
                        <span className="text-xs uppercase tracking-widest opacity-50">Select a file from Explorer</span>
                    </div>
                )}

                {/* Local Suggestion Interaction — pinned specifically to editor pane */}
                <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none">
                    <div className="w-full max-w-[800px] pointer-events-auto">
                        <SuggestionOverlay />
                    </div>
                </div>
            </div>
        </div>
    )
}

function inferLang(path: string) {
    const ext = path?.split(".").pop()?.toLowerCase() ?? ""
    return ({ js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript", css: "css", html: "html", json: "json" } as any)[ext] ?? "plaintext"
}

