"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Upload, Tag, Globe, MessageSquare, Code2, 
    ShieldAlert, CheckCircle2, Loader2, Link2,
    LayoutGrid, PlusCircle, Database, Zap, ArrowUpRight
} from "lucide-react"
import { templateService } from "@/services/template.service"
import { useRouter } from "next/navigation"
import { ClientTemplateGrid } from "@/components/templates/ClientTemplateGrid"
import { cn } from "@/lib/utils"
import { useSnackbar } from "notistack"

export default function AdminTemplateUploadPage() {
    const router = useRouter()
    const { enqueueSnackbar } = useSnackbar()
    const [activeTab, setActiveTab] = useState<"deploy" | "library">("deploy")
    const [loading, setLoading] = useState(false)
    const [templateCount, setTemplateCount] = useState(0)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        domain: "Personal",
        gitRepoUrl: "",
        techStack: "React, Next.js, TailwindCSS",
        adminKey: "",
    })
    const [file, setFile] = useState<File | null>(null)
    const [previewFiles, setPreviewFiles] = useState<File[]>([])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // 1. Verify Key First (Lightweight Check)
        const isKeyValid = await templateService.verifyKey(formData.adminKey)
        if (!isKeyValid) {
            enqueueSnackbar("Authentication Failed: Invalid Admin Secret Signature.", { 
                variant: "error",
                style: { 
                    background: "#ef4444", 
                    color: "white", 
                    borderRadius: "12px", 
                    fontFamily: "monospace", 
                    fontSize: "12px", 
                    textTransform: "uppercase" 
                }
            })
            return
        }

        setLoading(true)

        try {
            const data = new FormData()
            data.append("name", formData.name)
            data.append("description", formData.description)
            data.append("domain", formData.domain)
            data.append("gitRepoUrl", formData.gitRepoUrl)
            
            const techStackArray = formData.techStack.split(",").map(s => s.trim())
            data.append("techStack", JSON.stringify(techStackArray))

            if (file) {
                data.append("thumbFile", file)
            }
            
            previewFiles.forEach(f => {
                data.append("previewFiles", f)
            })

            await templateService.uploadTemplate(data, formData.adminKey)
            
            enqueueSnackbar("Template published successfully!", { variant: "success", style: { background: "#10b981", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
            setFormData({
                name: "",
                description: "",
                domain: "Personal",
                gitRepoUrl: "",
                techStack: "React, Next.js, TailwindCSS",
                adminKey: formData.adminKey,
            })
            setFile(null)
            setPreviewFiles([])
            
            setTimeout(() => {
                setActiveTab("library")
            }, 2000)
        } catch (err: any) {
            console.error("UPLOAD_ERROR:", err)
            
            let errorMessage = "Upload failed. Please try again."
            
            if (err.response?.status === 401 || err.response?.status === 403) {
                errorMessage = "Invalid Admin Sequence Header. Access Denied."
            } else if (err.response?.data?.error?.message?.toLowerCase().includes("slug") || err.message?.toLowerCase().includes("already exists")) {
                errorMessage = "Deployment Conflict: A blueprint with this design signature already exists."
            } else if (err.response?.data?.error?.message) {
                errorMessage = err.response.data.error.message
            }

            enqueueSnackbar(errorMessage, { 
                variant: "error", 
                style: { 
                    background: "#ef4444", 
                    color: "white", 
                    borderRadius: "12px", 
                    fontFamily: "monospace", 
                    fontSize: "12px", 
                    textTransform: "uppercase" 
                } 
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none translate-y-1/2" />

            <div className="relative p-4 lg:p-8 max-w-screen-2xl mx-auto space-y-12 pb-32">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
                                Management Console
                            </span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                            Architectural <br/>
                            <span className="text-primary italic">Blueprints.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium max-w-xl">
                            Register and govern high-performance portfolio templates. Ensure all source code repositories are optimized for automated deployment.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="clay-surface px-6 py-4 bg-background/50 backdrop-blur-xl border-border/50 shadow-xl flex items-center gap-4 group hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Templates</p>
                                <p className="text-xl font-black">DEPLOY</p>
                            </div>
                        </div>
                        <div className="clay-surface px-6 py-4 bg-background/50 backdrop-blur-xl border-border/50 shadow-xl flex items-center gap-4 group hover:border-blue-500/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Assets</p>
                                <p className="text-xl font-black">{templateCount} Blueprints</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 p-1.5 bg-muted/30 backdrop-blur-md rounded-2xl w-fit border border-border/50">
                    <button
                        onClick={() => setActiveTab("deploy")}
                        className={cn(
                            "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === "deploy" 
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 scale-95"
                        )}
                    >
                        <PlusCircle className="w-4 h-4" />
                        Deploy New
                    </button>
                    <button
                        onClick={() => setActiveTab("library")}
                        className={cn(
                            "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            activeTab === "library" 
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 scale-95"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Manage Library
                    </button>
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === "deploy" ? (
                        <motion.div
                            key="deploy-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
                        >
                            {/* Form Column */}
                            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
                                <div className="clay-surface p-10 space-y-10 bg-background/40 backdrop-blur-2xl border-border/50 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <PlusCircle className="w-32 h-32" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Name */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                <Tag className="w-3 h-3 text-primary" /> Template Designation
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Minimalist Dark"
                                                className="w-full bg-muted/40 border-2 border-border/40 rounded-2xl px-6 h-14 font-bold focus:outline-none focus:border-primary focus:bg-background transition-all shadow-inner"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        {/* Domain */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                <Globe className="w-3 h-3 text-primary" /> Core Category
                                            </label>
                                            <select
                                                className="w-full bg-muted/40 border-2 border-border/40 rounded-2xl px-6 h-14 font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                                value={formData.domain}
                                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                            >
                                                <option>Personal</option>
                                                <option>Developer</option>
                                                <option>Creative</option>
                                                <option>Minimalist</option>
                                            </select>
                                        </div>

                                        {/* Git Repo URL */}
                                        <div className="col-span-full space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                <Link2 className="w-3 h-3 text-primary" /> Source Repository (Github)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type="url"
                                                    placeholder="https://github.com/user/repo-template.git"
                                                    className="w-full bg-muted/40 border-2 border-border/40 rounded-2xl px-6 h-14 font-bold focus:outline-none focus:border-primary transition-all pl-14"
                                                    value={formData.gitRepoUrl}
                                                    onChange={(e) => setFormData({ ...formData, gitRepoUrl: e.target.value })}
                                                />
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border">
                                                    <Code2 className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tech Stack */}
                                        <div className="col-span-full space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                <Zap className="w-3 h-3 text-primary" /> Technology Stack (Tags)
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="React, Next.js, Framer Motion, TailwindCSS..."
                                                className="w-full bg-muted/40 border-2 border-border/40 rounded-2xl px-6 h-14 font-bold focus:outline-none focus:border-primary transition-all"
                                                value={formData.techStack}
                                                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="col-span-full space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                                <MessageSquare className="w-3 h-3 text-primary" /> Blueprint Abstract
                                            </label>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="Detailed description of the template's unique selling points and target audience..."
                                                className="w-full bg-muted/40 border-2 border-border/40 rounded-[2rem] px-6 py-5 font-bold focus:outline-none focus:border-primary transition-all resize-none shadow-inner"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Sidebar Column (Auth & File) */}
                            <div className="space-y-8">
                                {/* File Upload */}
                                <div className="clay-surface p-8 bg-background/50 backdrop-blur-xl border-border/50 shadow-xl space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black italic tracking-tight">Visual Identity</h3>
                                        <p className="text-xs text-muted-foreground font-medium">Upload a high-resolution thumbnail preview.</p>
                                    </div>

                                    <div 
                                        className={cn(
                                            "w-full bg-muted/20 border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group min-h-[200px]",
                                            file ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-primary/30"
                                        )}
                                        onClick={() => document.getElementById("thumb-upload")?.click()}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                                            file ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                                        )}>
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-black text-foreground">
                                                {file ? "Asset Ready" : "Thumbnail"}
                                            </p>
                                        </div>
                                        <input
                                            id="thumb-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>

                                {/* Multi Preview Upload */}
                                <div className="clay-surface p-8 bg-background/50 backdrop-blur-xl border-border/50 shadow-xl space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black italic tracking-tight">Structural Previews</h3>
                                        <p className="text-xs text-muted-foreground font-medium">Select up to 3 lifestyle or UI previews.</p>
                                    </div>

                                    <div 
                                        className={cn(
                                            "w-full bg-muted/20 border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
                                            previewFiles.length > 0 ? "border-blue-500/50 bg-blue-500/5" : "border-border/50 hover:border-blue-500/30"
                                        )}
                                        onClick={() => document.getElementById("previews-upload")?.click()}
                                    >
                                        <div className="flex gap-2">
                                            {previewFiles.length > 0 ? (
                                                previewFiles.map((_, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <LayoutGrid className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm font-black text-foreground">
                                            {previewFiles.length > 0 ? `${previewFiles.length} Selected` : "Select Gallery"}
                                        </p>
                                        <input
                                            id="previews-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []).slice(0, 3);
                                                setPreviewFiles(files);
                                            }}
                                        />
                                    </div>
                                    {previewFiles.length > 0 && (
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setPreviewFiles([]); }}
                                            className="w-full text-[10px] font-black uppercase tracking-widest text-destructive hover:text-destructive/80 transition-colors"
                                        >
                                            Clear Gallery
                                        </button>
                                    )}
                                </div>

                                {/* Security Key */}
                                <div className="clay-surface p-8 bg-primary/5 border-primary/20 shadow-xl space-y-6">
                                    <div className="flex items-center gap-3">
                                        <ShieldAlert className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-black tracking-tight uppercase tracking-[0.1em]">Security Auth</h3>
                                    </div>
                                    
                                    <input
                                        required
                                        type="password"
                                        placeholder="Admin Secret Signature"
                                        className="w-full bg-background/80 border-2 border-primary/20 rounded-2xl px-6 h-14 font-black tracking-[0.3em] focus:outline-none focus:border-primary transition-all placeholder:tracking-normal placeholder:font-bold text-center"
                                        value={formData.adminKey}
                                        onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                                    />

                                    <button
                                        disabled={loading}
                                        onClick={handleSubmit}
                                        className="w-full clay-button h-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Publish Blueprint
                                                <ArrowUpRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="library-tab"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tighter italic">Governed Assets</h2>
                                    <p className="text-sm text-muted-foreground font-medium">Currently active blueprints in the automation engine.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="px-4 py-2 bg-muted/50 rounded-xl border border-border/50 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                        Total: <span className="text-primary">{templateCount} Assets</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-muted/10 p-4 lg:p-6 rounded-[3rem] border border-border/20 backdrop-blur-sm">
                                <ClientTemplateGrid 
                                    isAdmin={true} 
                                    adminKey={formData.adminKey} 
                                    onLoad={(tpls) => setTemplateCount(tpls.length)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Attribution */}
                <div className="pt-20 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em]">
                        Proprietary Deployment Infrastructure © 2026 PAT
                    </p>
                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                        <span>Status: Operational</span>
                        <span className="text-primary">Region: Global-Alpha</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

