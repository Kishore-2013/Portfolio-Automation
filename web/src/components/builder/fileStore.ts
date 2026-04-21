"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { validateAndLog } from "./validateTemplate"
import { ReconciliationData } from "../portfolio/parsing/types"
import { projectService } from "@/services/project.service"
import { resumeService } from "@/services/resume.service"
import { previewService } from "@/services/preview.service"
import { TemplateDTO, ProjectDTO, FileNode } from "@/shared/types"

export interface VirtualFile { code: string; language?: string }
export type VirtualFileSystem = Record<string, VirtualFile>
export interface Instance {
    instanceId: string; templateId: string; name: string
    files: VirtualFileSystem; createdAt: number; updatedAt: number
}

interface FileStoreState {
    projects: ProjectDTO[]
    instances: Record<string, Instance>
    currentInstanceId: string | null
    projectFiles: VirtualFileSystem
    activeFile: string
    editorBuffers: Record<string, string>
    pendingSandpackSync: { seq: number; files: Record<string, string> } | null
    resumeFile: File | null
    resumeText: string | null
    parsedResume: ReconciliationData | null
    suggestedChanges: { filePath: string; originalCode: string; proposedCode: string } | null
    previewUrl: string | null
    isPreviewLoading: boolean
    isSaving: boolean
    previewRefreshKey: number
    previewError: string | null
    loadError: string | null
    loadProjects: () => Promise<void>
    startPreview: () => Promise<void>
    stopPreview: () => Promise<void>
    refreshPreview: () => void
    setCurrentInstance: (instanceId: string) => void | Promise<void>
    updateFile: (path: string, code: string) => void
    setActiveFile: (path: string) => void
    loadFile: (path: string) => Promise<void>
    loadAllProjectFiles: () => Promise<void>
    setEditorBuffer: (path: string, code: string) => void
    saveFile: (path: string) => void
    saveAllFiles: () => void
    applyAIChanges: (changes: Array<{ filePath: string; proposedCode: string }>) => void
    addFile: (path: string, code: string) => void
    removeFile: (path: string) => void
    clearPendingSync: () => void
    forceRefresh: () => void // New method to force re-key
    refreshKey: number
    setResumeFile: (file: File) => void
    performParsing: () => Promise<void>
    createProject: (templateId: string, name?: string) => Promise<ProjectDTO>
    generateSuggestions: () => void
    acceptSuggestions: () => void
    rejectSuggestions: () => void
    loadLatestResume: () => Promise<void>
}

let syncSeq = 0

export const useFileStore = create<FileStoreState>()(
    (set, get) => ({
            projects: [],
            instances: {},
            currentInstanceId: null,
            projectFiles: {},
            activeFile: "",
            editorBuffers: {},
            pendingSandpackSync: null,
            refreshKey: 0,
            resumeFile: null,
            resumeText: null,
            parsedResume: null,
            suggestedChanges: null,
        previewUrl: null,
        isPreviewLoading: false,
        isSaving: false,
        previewRefreshKey: 0,
        previewError: null,
        loadError: null,

            // ─────────────────────────────────────────────────────────────────
            setResumeFile: (file) => set({ resumeFile: file }),

            performParsing: async () => {
                const { resumeFile } = get()
                if (!resumeFile) return

                try {
                    const parsed = await resumeService.parseResume(resumeFile)
                    if (!parsed || !parsed.personal) {
                        throw new Error("Invalid resume data received from server");
                    }

                    // Map ParsedData to ReconciliationData for the UI
                    set({
                        parsedResume: {
                            progress: 100,
                            unresolvedWarnings: 0,
                            extraSections: 0,
                            accuracy: "AI Extracted Data",
                            personalDetails: {
                                fullName: parsed.personal.name,
                                email: parsed.personal.email,
                                github: parsed.personal.github,
                                linkedin: parsed.personal.linkedin,
                                summary: parsed.summary,
                            },
                            skills: parsed.skills,
                            experience: parsed.experiences.map(exp => ({
                                role: exp.title,
                                company: exp.company,
                                period: exp.period,
                                desc: exp.bullets
                            })),
                            education: parsed.educations.map(edu => ({
                                degree: edu.degree,
                                institution: edu.institution,
                                year: edu.year,
                                grade: edu.grade
                            })),
                            projects: parsed.projects,
                            certifications: parsed.certifications,
                            missingRequired: [],
                            orphanedData: [],
                        },
                    })

                } catch (error) {
                    throw error
                }
            },

            generateSuggestions: () => {
                // TODO: Implement actual AI data injection later
                set({ suggestedChanges: null })
            },

            loadProjects: async () => {
                try {
                    const projects = await projectService.getProjects()
                    set({ projects })
                } catch (error) {
                    // Silently fail or handle gracefully
                }
            },

            startPreview: async () => {
                const { currentInstanceId } = get()
                if (!currentInstanceId) {
                    return
                }

                set({ isPreviewLoading: true, previewError: null, loadError: null })
                try {
                    await previewService.startPreview(Number(currentInstanceId))
                    
                    // Poll for status until active and previewUrl is present
                    let attempts = 0
                    const maxAttempts = 90 // Increased to allow 3 minutes (90 * 2s) for heavy installs
                    const poll = async () => {
                        if (attempts >= maxAttempts) {
                            const errorMsg = `Preview timeout: Dev server did not start after ${maxAttempts * 2}s. Check server logs.`
                            set({ isPreviewLoading: false, previewError: errorMsg })
                            return
                        }
                        attempts++
                        try {
                            const status = await previewService.getStatus(Number(currentInstanceId))
                            if (status.isActive && status.previewUrl) {
                                set({ previewUrl: status.previewUrl, isPreviewLoading: false, previewError: null })
                            } else {
                                setTimeout(poll, 2000)
                            }
                        } catch (pollError) {
                            console.error(`[fileStore] ⚠️ Error during polling:`, pollError)
                            setTimeout(poll, 2000) // Continue polling even on error
                        }
                    }
                    poll()
                } catch (error: any) {
                    const message = error.response?.data?.message || error.message || "Failed to start preview"
                    set({ isPreviewLoading: false, previewError: message })
                }
            },

            stopPreview: async () => {
                const { currentInstanceId } = get()
                if (!currentInstanceId) return

                try {
                    await previewService.stopPreview(Number(currentInstanceId))
                    set({ previewUrl: null, isPreviewLoading: false })
                } catch (error) {
                    // Stop preview failed
                }
            },

            refreshPreview: () => {
                set(s => ({ previewRefreshKey: s.previewRefreshKey + 1 }))
            },

            // ─── Real Backend Integration ─────────────────────────────────────
            createProject: async (templateId, name) => {
                try {
                    const project = await projectService.createProject({ templateId, name: name || "" })

                    const newInstance: Instance = {
                        instanceId: String(project.id),
                        templateId,
                        name: project.name,
                        files: {},
                        createdAt: new Date(project.createdAt).getTime(),
                        updatedAt: Date.now()
                    }

                    // 1. First update metadata and current ID so loadAllProjectFiles knows what to do
                    set({
                        projects: [...get().projects, project],
                        instances: { ...get().instances, [project.id]: newInstance },
                        currentInstanceId: String(project.id),
                        projectFiles: {},
                        editorBuffers: {},
                        pendingSandpackSync: null,
                    })

                    // 2. Fetch the actual files from the backend
                    await get().loadAllProjectFiles()

                    return project
                } catch (error: any) {
                    const message = error.response?.data?.message || error.message || "Project setup failed"
                    set({ loadError: message })
                    throw error
                }
            },

            setCurrentInstance: async (id: string) => {
                const currentInstances = get().instances
                const inst = currentInstances[id]

                // Set the basic state first
                set({
                    currentInstanceId: id,
                    projectFiles: inst?.files || {},
                    editorBuffers: {},
                    pendingSandpackSync: null,
                    loadError: null
                })

                // If instance record is missing or files are empty, fetch from backend
                if (!inst || !inst.files || Object.keys(inst.files).length === 0) {
                    
                    // Create placeholder if missing to avoid downstream null checks
                    if (!inst) {
                        set(s => ({
                            instances: {
                                ...s.instances,
                                [id]: { 
                                    instanceId: id, 
                                    templateId: "restored", 
                                    name: "Loading...", 
                                    files: {},
                                    createdAt: Date.now(),
                                    updatedAt: Date.now()
                                }
                            }
                        }))
                    }
                    
                    await get().loadAllProjectFiles()
                } else {
                    // Just set the active file from existing ones
                    const activeFile = inst.files["src/App.js"] ? "src/App.js"
                        : inst.files["src/App.jsx"] ? "src/App.jsx"
                            : inst.files["src/App.tsx"] ? "src/App.tsx"
                                : Object.keys(inst.files)[0] || ""
                    set({ activeFile })
                }

                // If we don't have a parsed resume in memory, try to load it from DB
                if (!get().parsedResume) {
                    await get().loadLatestResume();
                }
            },

            loadFile: async (path) => {
                const { currentInstanceId, projectFiles } = get()
                if (!currentInstanceId) return

                // If already has code, don't re-fetch
                if (projectFiles[path]?.code) return

                try {
                    const { content } = await projectService.getFileContent(Number(currentInstanceId), path)
                    get().updateFile(path, content)
                } catch (err) {
                    // Failed to load file
                }
            },

            loadAllProjectFiles: async () => {
                const { currentInstanceId } = get()
                if (!currentInstanceId) return

                try {
                    const { files } = await projectService.getFullVFS(Number(currentInstanceId))
                    
                    const updatedFiles: VirtualFileSystem = {}
                    Object.entries(files).forEach(([p, content]) => {
                        updatedFiles[normalizePath(p)] = {
                            code: content,
                            language: inferLanguage(p)
                        }
                    })

                    const activeFile = updatedFiles["src/App.js"] ? "src/App.js"
                        : updatedFiles["src/App.jsx"] ? "src/App.jsx"
                            : updatedFiles["src/App.tsx"] ? "src/App.tsx"
                                : Object.keys(updatedFiles)[0] || ""

                    set(s => {
                        const instances = { ...s.instances };
                        if (instances[currentInstanceId]) {
                            instances[currentInstanceId] = {
                                ...instances[currentInstanceId],
                                files: updatedFiles,
                                updatedAt: Date.now()
                            };
                        } else {
                            // Safe fallback in case instance record was missing
                            instances[currentInstanceId] = {
                                instanceId: currentInstanceId,
                                templateId: "restored",
                                name: "Restored Project",
                                files: updatedFiles,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            }
                        }
                        return {
                            projectFiles: updatedFiles,
                            activeFile: s.activeFile || activeFile,
                            refreshKey: s.refreshKey + 1,
                            instances
                        };
                    })
                } catch (err: any) {
                    const message = err.response?.data?.message || err.message || "Failed to load project files"
                    set({ loadError: message })
                }
            },

            updateFile: (path, code) => set(s => {
                const id = s.currentInstanceId
                if (!id || !s.instances[id]) { return s }
                const normalizedPath = normalizePath(path)
                const updatedFiles: VirtualFileSystem = { ...s.projectFiles, [normalizedPath]: { code, language: inferLanguage(normalizedPath) } }

                const instances = { ...s.instances };
                if (instances[id]) {
                    instances[id] = {
                        ...instances[id],
                        files: updatedFiles,
                        updatedAt: Date.now()
                    };
                }
                return {
                    projectFiles: updatedFiles,
                    instances
                };
            }),

            setEditorBuffer: (p, c) => set(s => ({ editorBuffers: { ...s.editorBuffers, [p]: c } })),
            setActiveFile: (path) => {
                set({ activeFile: path })
                // Trigger background load if content missing
                get().loadFile(path)
            },
            clearPendingSync: () => set({ pendingSandpackSync: null }),

            // ─── saveFile: reads buffer, writes to API, signals UI ──────
            saveFile: async (path) => {
                const { editorBuffers, projectFiles, currentInstanceId } = get()
                const code = editorBuffers[path]

                if (code === undefined) {
                    return
                }

                if (!currentInstanceId) {
                    return
                }

                const normalizedPath = normalizePath(path)
                set({ isSaving: true })
                try {
                    // 1. Actually Save to Backend Disk
                    await projectService.saveFileContent(Number(currentInstanceId), normalizedPath, code)

                    // 2. Update Local State to reflect it is clean
                    get().updateFile(normalizedPath, code)

                    set(s => {
                        const next = { ...s.editorBuffers }
                        delete next[path]
                        return { editorBuffers: next } // No longer using Sandpack sync object
                    })
                    // 3. Trigger preview refresh
                    get().refreshPreview()
                } catch (err) {
                    // Failed to save file
                } finally {
                    set({ isSaving: false })
                }
            },

            saveAllFiles: async () => {
                const { editorBuffers, updateFile, currentInstanceId } = get()
                const paths = Object.keys(editorBuffers)
                if (!paths.length) return

                if (!currentInstanceId) {
                    return
                }

                set({ isSaving: true })
                try {
                    // Start saving all dirty files to backend in parallel
                    await Promise.all(
                        paths.map(async (p) => {
                            const normalized = normalizePath(p)
                            const code = editorBuffers[p]!
                            await projectService.saveFileContent(Number(currentInstanceId), normalized, code)
                            updateFile(normalized, code)
                        })
                    )

                    // Clear all dirty buffers
                    set({ editorBuffers: {} })

                    // Trigger preview refresh
                    get().refreshPreview()
                } catch (err) {
                    // Failed to save all files
                } finally {
                    set({ isSaving: false })
                }
            },

            // ─── applyAIChanges: used by external callers ────────────────────
            applyAIChanges: (changes) => {
                const payload: Record<string, string> = {}
                changes.forEach(({ filePath, proposedCode }) => {
                    const normalized = normalizePath(filePath)
                    get().updateFile(normalized, proposedCode)
                    payload[normalized] = proposedCode
                })
                set(s => {
                    const next = { ...s.editorBuffers }
                    changes.forEach(({ filePath }) => delete next[normalizePath(filePath)])
                    return { editorBuffers: next, pendingSandpackSync: { seq: ++syncSeq, files: payload } }
                })
            },

            // ─── acceptSuggestions ────────────────────────────────────────────
            acceptSuggestions: () => {
                const { suggestedChanges } = get()
                if (!suggestedChanges) return

                const { filePath, proposedCode } = suggestedChanges

                // IMPORTANT: We do NOT update VFS here. 
                // We only put it in the buffer so it appears in the editor as "unsaved".
                set(s => ({
                    editorBuffers: { ...s.editorBuffers, [filePath]: proposedCode },
                    suggestedChanges: null,
                    activeFile: filePath // Take user to the changed file
                }))
            },

            rejectSuggestions: () => {
                set({ suggestedChanges: null })
            },

            addFile: (path, code) => {
                const normalized = normalizePath(path)
                get().updateFile(normalized, code)
                const seq = ++syncSeq
                set({ pendingSandpackSync: { seq, files: { [normalized]: code } }, activeFile: normalized })
            },

            removeFile: (path) => {
                const normalized = normalizePath(path)
                const id = get().currentInstanceId
                if (!id || !get().instances[id]) return

                const updatedFiles = { ...get().projectFiles }
                delete updatedFiles[normalized]

                const updatedInstances = { ...get().instances }
                const currentInst = updatedInstances[id]
                if (currentInst) {
                    updatedInstances[id] = { ...currentInst, files: updatedFiles, updatedAt: Date.now() }
                }

                set({
                    projectFiles: updatedFiles,
                    instances: updatedInstances,
                    // If we deleted the active file, switch to another one
                    activeFile: get().activeFile === normalized ? Object.keys(updatedFiles)[0] ?? "" : get().activeFile
                })
                // Note: Sandpack doesn't easily support deleting files via updateFile, 
                // but removing it from projectFiles will trigger a reload via the Provider fallback.
            },
            forceRefresh: async () => {
                set(s => ({ refreshKey: s.refreshKey + 1 }))
                await get().loadAllProjectFiles()
                get().refreshPreview()
            },

            loadLatestResume: async () => {
                try {
                    const parsed = await resumeService.getLatestResume();
                    if (parsed) {
                        set({ parsedResume: mapParsedToReconciliation(parsed) });
                    }
                } catch (error) {
                    console.warn("[fileStore] Failed to load latest resume:", error);
                }
            }
        })
);

function mapParsedToReconciliation(parsed: any): ReconciliationData {
    return {
        progress: 100,
        unresolvedWarnings: 0,
        extraSections: 0,
        accuracy: "AI Extracted Data",
        personalDetails: {
            fullName: parsed.personal?.name || "",
            email: parsed.personal?.email || "",
            github: parsed.personal?.github || "",
            linkedin: parsed.personal?.linkedin || "",
            summary: parsed.summary || "",
        },
        skills: parsed.skills || [],
        experience: (parsed.experiences || []).map((exp: any) => ({
            role: exp.title || "",
            company: exp.company || "",
            period: exp.period || "",
            desc: exp.bullets || []
        })),
        education: (parsed.educations || []).map((edu: any) => ({
            degree: edu.degree || "",
            institution: edu.institution || "",
            year: edu.year || "",
            grade: edu.grade || ""
        })),
        projects: parsed.projects || [],
        certifications: parsed.certifications || [],
        missingRequired: [],
        orphanedData: [],
    };
}

export function normalizePath(path: string): string {
    if (!path) return ""
    const normalized = path.replace(/\\/g, "/")
    return normalized.startsWith("/") ? normalized.slice(1) : normalized
}

export function inferLanguage(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase() ?? ""
    const mapping: Record<string, string> = {
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        css: "css",
        html: "html",
        json: "json"
    }
    return mapping[ext] ?? "plaintext"
}

export function normalizeBackendFiles(raw: Record<string, any>): VirtualFileSystem {
    return Object.fromEntries(
        Object.entries(raw).map(([path, content]) => [
            normalizePath(path),
            { code: (content && typeof content === "object" && "code" in content) ? String(content.code) : String(content), language: inferLanguage(path) }
        ])
    )
}

