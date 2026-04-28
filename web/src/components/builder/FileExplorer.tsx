"use client"

import React, { useMemo, useState, useEffect, memo } from "react"
import { useFileStore } from "./fileStore"
import { FileCode2, FolderOpen, Folder, ChevronRight, ChevronDown, Search, Plus, MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// ─── Build a folder tree from flat paths ─────────────────────────────────────

type TreeNode =
    | { kind: "file"; name: string; path: string }
    | { kind: "dir"; name: string; children: TreeNode[] }

function buildTree(paths: string[]): TreeNode[] {
    const root: TreeNode[] = []

    for (const fullPath of paths) {
        const parts = fullPath.replace(/^\//, "").split("/")
        let currentLevel = root

        parts.forEach((part, idx) => {
            const isFile = idx === parts.length - 1
            let existingNode = currentLevel.find((n) => n.name === part)

            if (!existingNode) {
                if (isFile) {
                    existingNode = { kind: "file", name: part, path: fullPath }
                    currentLevel.push(existingNode)
                } else {
                    existingNode = { kind: "dir", name: part, children: [] }
                    currentLevel.push(existingNode)
                }
            }

            if (existingNode.kind === "dir") {
                currentLevel = existingNode.children
            }
        })
    }

    // Sort to keep directories on top
    const sortNodes = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1
            return a.name.localeCompare(b.name)
        })
        nodes.forEach(n => {
            if (n.kind === "dir") sortNodes(n.children)
        })
    }
    sortNodes(root)

    return root
}

// ─── Tree rendering ──────────────────────────────────────────────────────────

const FileItem = memo(({
    node,
    depth,
    activeFile,
    onSelect,
    onDelete,
}: {
    node: TreeNode
    depth: number
    activeFile: string
    onSelect: (path: string) => void
    onDelete: (path: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(true)

    if (node.kind === "dir") {
        return (
            <div className="w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-[#16161b] rounded-md transition-colors text-muted-foreground group"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                >
                    <div className="w-4 h-4 flex items-center justify-center">
                        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                    {isOpen ? (
                        <FolderOpen className="w-3.5 h-3.5 text-indigo-400/80" />
                    ) : (
                        <Folder className="w-3.5 h-3.5 text-indigo-400/80" />
                    )}
                    <span className="text-xs font-semibold truncate group-hover:text-foreground">
                        {node.name}
                    </span>
                </button>
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            {node.children.map((child) => (
                                <FileItem
                                    key={child.name + depth}
                                    node={child}
                                    depth={depth + 1}
                                    activeFile={activeFile}
                                    onSelect={onSelect}
                                    onDelete={onDelete}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    const isActive = node.path === activeFile
    return (
        <div className="group relative pr-2">
            <button
                onClick={() => onSelect(node.path)}
                className={cn(
                    "flex items-center gap-2 w-full px-2 py-1 rounded-md transition-all relative",
                    isActive
                        ? "bg-[#1a1a1f] text-indigo-400 font-bold"
                        : "text-muted-foreground hover:bg-[#16161b] hover:text-foreground"
                )}
                style={{ paddingLeft: `${depth * 12 + 25}px` }}
            >
                {isActive && (
                    <motion.div
                        layoutId="active-indicator"
                        className="absolute left-1 w-1 h-4 bg-indigo-500 rounded-full"
                    />
                )}
                <FileCode2 className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-indigo-400" : "text-muted-foreground transition-colors group-hover:text-indigo-400/70")} />
                <span className="text-xs truncate">{node.name}</span>
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDelete(node.path)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                title="Delete File"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    )
})

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FileExplorer() {
    const projects = useFileStore(s => s.projects)
    const instances = useFileStore(s => s.instances)
    const currentInstanceId = useFileStore(s => s.currentInstanceId)
    const projectFiles = useFileStore(s => s.projectFiles)
    const activeFile = useFileStore(s => s.activeFile)
    const setActiveFile = useFileStore(s => s.setActiveFile)
    const addFile = useFileStore(s => s.addFile)
    const removeFile = useFileStore(s => s.removeFile)
    const setCurrentInstance = useFileStore(s => s.setCurrentInstance)
    const loadProjects = useFileStore(s => s.loadProjects)
    const [isCreating, setIsCreating] = useState(false)
    const [newFileName, setNewFileName] = useState("")
    const [filter, setFilter] = useState("")
    const [showInstanceSwitcher, setShowInstanceSwitcher] = useState(false)

    // Load projects on mount
    useEffect(() => {
        loadProjects()
    }, [])

    const currentInstance = currentInstanceId ? (projects.find(p => String(p.id) === currentInstanceId) || instances[currentInstanceId]) : null
    const paths = Object.keys(projectFiles)

    // Re-initialize if currentInstanceId is set but files are missing
    useEffect(() => {
        if (currentInstanceId && paths.length === 0) {
            setCurrentInstance(currentInstanceId)
        }
    }, [currentInstanceId])

    const filteredPaths = useMemo(() => {
        if (!filter) return paths
        return paths.filter(p => p.toLowerCase().includes(filter.toLowerCase()))
    }, [paths, filter])

    const tree = useMemo(() => {
        return buildTree(filteredPaths)
    }, [filteredPaths])

    const handleCreateFile = () => {
        if (!newFileName) {
            setIsCreating(false)
            return
        }
        let finalPath = newFileName
        if (!finalPath.startsWith("/")) finalPath = "/" + finalPath
        addFile(finalPath, "// New file created in builder")
        setNewFileName("")
        setIsCreating(false)
    }

    return (
        <aside className="flex flex-col h-full bg-[#0f0f12] select-none border-r border-[#1c1c22]">
            {/* Instance Switcher (Simulated Backend) */}
            <div className="px-3 py-2 border-b border-[#1c1c22] bg-[#16161b]/50">
                <button
                    onClick={() => setShowInstanceSwitcher(!showInstanceSwitcher)}
                    className="flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-[#1c1c22] transition-colors group"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate group-hover:text-indigo-400 transition-colors">
                            {currentInstance?.name ?? "Select Project"}
                        </span>
                    </div>
                    <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", showInstanceSwitcher && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {showInstanceSwitcher && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 space-y-1 overflow-hidden"
                        >
                            {projects.map((proj) => (
                                <button
                                    key={proj.id}
                                    onClick={() => {
                                        setCurrentInstance(String(proj.id))
                                        setShowInstanceSwitcher(false)
                                    }}
                                    className={cn(
                                        "w-full text-left px-2 py-1.5 rounded text-[10px] font-bold transition-colors",
                                        String(proj.id) === currentInstanceId
                                            ? "bg-indigo-500/10 text-indigo-400"
                                            : "text-muted-foreground hover:bg-[#1c1c22] hover:text-foreground"
                                    )}
                                >
                                    {proj.name}
                                </button>
                            ))}
                            {projects.length === 0 && Object.values(instances).map((inst) => (
                                <button
                                    key={inst.instanceId}
                                    onClick={() => {
                                        setCurrentInstance(inst.instanceId)
                                        setShowInstanceSwitcher(false)
                                    }}
                                    className={cn(
                                        "w-full text-left px-2 py-1.5 rounded text-[10px] font-bold transition-colors",
                                        inst.instanceId === currentInstanceId
                                            ? "bg-indigo-500/10 text-indigo-400"
                                            : "text-muted-foreground hover:bg-[#1c1c22] hover:text-foreground"
                                    )}
                                >
                                    {inst.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c22]">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Project Files
                    </span>
                    <div className="px-1.5 py-0.5 rounded bg-[#1c1c22] text-[9px] font-bold text-muted-foreground">
                        {paths.length}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1 hover:bg-[#1c1c22] rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="New File"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:bg-[#1c1c22] rounded transition-colors text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Search and Create */}
            <div className="px-3 py-2 space-y-2">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-[#0b0b0e] border border-[#1c1c22] rounded-md pl-7 pr-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/50"
                    />
                </div>

                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            exit={{ scaleY: 0, opacity: 0 }}
                            className="relative origin-top"
                        >
                            <input
                                autoFocus
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateFile()
                                    if (e.key === "Escape") setIsCreating(false)
                                }}
                                onBlur={() => {
                                    if (!newFileName) setIsCreating(false)
                                }}
                                placeholder="filename.js..."
                                className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-md px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-indigo-300 placeholder:text-indigo-400/40"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* File Tree */}
            <nav className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar">
                <div className="space-y-0.5">
                    {tree.map((node) => (
                        <FileItem
                            key={node.name}
                            node={node}
                            depth={0}
                            activeFile={activeFile}
                            onSelect={setActiveFile}
                            onDelete={removeFile}
                        />
                    ))}

                    {paths.length === 0 && !isCreating && (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                            <FileCode2 className="w-8 h-8 text-[#1c1c22]" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                                Empty Workspace<br />
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="text-indigo-500 hover:underline mt-1 font-bold"
                                >
                                    Create first file
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    )
}


