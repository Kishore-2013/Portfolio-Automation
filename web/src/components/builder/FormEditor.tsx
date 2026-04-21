"use client"

import React, { useEffect, useState } from "react"
import { useFileStore } from "./fileStore"
import { Loader2, Plus, Trash2, Save, FileJson, Sparkles } from "lucide-react"
import { useSnackbar } from "notistack"
import { aiService } from "@/services/ai.service"

export default function FormEditor() {
    const { projectFiles, pendingSandpackSync, editorBuffers, saveFile, parsedResume } = useFileStore()
    const { enqueueSnackbar } = useSnackbar()
    
    // Find the data file (Supports .json natively, or fallback to .js/.ts)
    const dataFilePath = Object.keys(projectFiles).find(p => 
        p.endsWith("data.json") || 
        p.endsWith("portfolioData.json") || 
        p.includes("portfolioData.js") || 
        p.includes("portfolioData.ts")
    )
    
    // The current code (either from un-saved buffer or from file system)
    const activeCode = dataFilePath 
        ? editorBuffers[dataFilePath] ?? projectFiles[dataFilePath]?.code ?? "" 
        : ""
        
    const [formData, setFormData] = useState<any>(null)
    const [parseError, setParseError] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    // Try to parse the configuration
    useEffect(() => {
        if (!activeCode || !dataFilePath) return
        
        try {
            if (dataFilePath.endsWith(".json")) {
                // If it's a JSON file, parse it as pure JSON
                const parsed = JSON.parse(activeCode)
                setFormData(parsed)
            } else {
                // If it's JS, do naive loose JS parsing
                let cleanCode = activeCode.replace(/export\s+default\s+portfolioData;?/g, '')
                cleanCode = cleanCode.replace(/export\s+const\s+portfolioData\s*=\s*/g, '')
                cleanCode = cleanCode.replace(/const\s+portfolioData\s*=\s*/g, '')
                cleanCode = cleanCode.trim()
                if (cleanCode.endsWith(";")) cleanCode = cleanCode.slice(0, -1)
                
                const getObj = new Function(`return ${cleanCode}`)
                const parsed = getObj()
                setFormData(parsed)
            }
            setParseError(null)
        } catch (e: any) {
            setParseError((e as Error).message)
            setFormData(null)
        }
    }, [activeCode, dataFilePath])

    // Generate string and update the store buffer
    const handleSave = () => {
        if (!dataFilePath || !formData) return
        
        const jsonStr = JSON.stringify(formData, null, 2)
        let newCode = ""

        if (dataFilePath.endsWith(".json")) {
            // Direct JSON save
            newCode = jsonStr
        } else {
            // JS Code format reconstruction
            const isExportConst = activeCode.includes("export const portfolioData")
            const isDefaultExport = !isExportConst && activeCode.includes("export default")
            
            if (isExportConst) {
                newCode = `export const portfolioData = ${jsonStr};`
            } else if (isDefaultExport) {
                newCode = `const portfolioData = ${jsonStr};\n\nexport default portfolioData;`
            } else {
                newCode = `export const portfolioData = ${jsonStr};\nexport default portfolioData;`
            }
        }
        
        // Push the update to zustand store
        useFileStore.getState().updateFile(dataFilePath, newCode)
        useFileStore.getState().setEditorBuffer(dataFilePath, newCode)
        
        // Actually save the file, triggering Sandpack auto-sync
        useFileStore.getState().saveFile(dataFilePath)
        
        enqueueSnackbar(`Data from ${dataFilePath.split('/').pop()} Saved`, { variant: "success" })
    }

    const handleAIGenerate = async () => {
        if (!parsedResume) {
            enqueueSnackbar("No parsed resume found! Upload one on the dashboard first.", { variant: "warning" })
            return
        }
        setIsGenerating(true)
        try {
            // Calls server1 → POST /api/ai/merge-resume
            const updatedData = await aiService.mergeResumeIntoPortfolioData(formData, parsedResume as any)
            setFormData(updatedData)
            enqueueSnackbar("AI customized your portfolio! Review changes and click Save & Apply.", { variant: "info" })
        } catch (e: any) {
            enqueueSnackbar(e?.response?.data?.error?.message || e.message || "AI merge failed", { variant: "error" })
        } finally {
            setIsGenerating(false)
        }
    }

    if (!dataFilePath) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-muted-foreground bg-[#0b0b0e]">
                <FileJson className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-bold uppercase tracking-widest text-[#fff]">No portfolioData file found</p>
                <p className="text-xs opacity-50 text-center mt-2 max-w-sm">
                    This template does not use an external data file, so the form editor is unavailable. Try the Code Editor instead.
                </p>
            </div>
        )
    }

    if (parseError || !formData) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-muted-foreground bg-[#0b0b0e]">
                <p className="text-red-400 font-bold mb-2">Could not parse data file</p>
                <div className="text-[10px] bg-red-500/10 p-4 rounded-xl border border-red-500/20 font-mono text-red-500/70">
                    {parseError || "Unknown parsing error."}
                </div>
                <p className="text-xs opacity-50 text-center mt-4">
                    The code in {dataFilePath} is not a valid JS object. Please fix syntax errors in the Code Editor first.
                </p>
            </div>
        )
    }

    // Simple check to identify if an object is "simple" (only contains primitives, no nested items)
    const isSimpleObject = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
        return Object.values(obj).every(v => typeof v !== 'object' || v === null);
    };

    // Dynamic recursive renderer for any structure
    const renderNode = (path: (string | number)[], value: any, depth: number = 0): React.ReactNode => {
        // Handle null/undefined
        if (value === null || value === undefined) return null;

        const isRoot = depth === 0;

        // Better formatting for labels
        const formatLabel = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        const nodeName = path.length > 0 ? String(path[path.length - 1]) : "Configuration";

        // Handle Arrays dynamically
        if (Array.isArray(value)) {
            return (
                <div key={path.join('.')} className={`${isRoot ? 'space-y-4 mb-6 mt-4' : 'mt-5 space-y-3'}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-[#2a2a30]">
                        <h3 className={`${isRoot ? 'text-sm' : 'text-xs'} font-bold text-[#e0e0e0] capitalize flex items-center gap-2 tracking-wide`}>
                            {isRoot && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                            {formatLabel(nodeName)}
                        </h3>
                        {/* Compact add button */}
                        <button 
                            onClick={() => handleAddArrayItem(path)}
                            className="flex items-center gap-1 text-[10px] uppercase font-bold text-white bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/20"
                        >
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>
                    
                    {value.length === 0 && (
                        <div className="p-4 text-center bg-[#0d0d10] border border-dashed border-[#2a2a30] rounded-lg text-muted-foreground/50 text-[11px] mt-2">
                            No items added. Click 'Add' to start.
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-3 mt-3">
                        {value.map((item, idx) => (
                            <div key={idx} className="p-4 bg-[#121216] border border-[#2a2a30] rounded-xl relative group transition-all hover:border-indigo-500/30">
                                <div className="absolute top-3 right-3 z-10">
                                    <button 
                                        onClick={() => handleRemoveArrayItem(path, idx)}
                                        className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors opacity-60 group-hover:opacity-100"
                                        title="Delete Item"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                {/* Header for the item */}
                                <div className="text-[10px] font-bold text-muted-foreground/40 uppercase mb-3 pb-2 border-b border-[#1c1c22]">
                                    Item {idx + 1}
                                </div>
                                <div className="pr-2">
                                    {renderNode([...path, idx], item, depth + 1)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Handle nested Objects dynamically (that are not arrays)
        if (typeof value === 'object') {
            const simpleObj = isRoot ? false : isSimpleObject(value);
            
            return (
                <div key={path.join('.')} className={`${isRoot ? 'space-y-5 mb-8' : simpleObj ? 'mt-3' : 'mt-4 p-4 bg-[#121216] border border-[#2a2a30] rounded-xl'}`}>
                    {/* Header for nested non-simple objects */}
                    {(!isRoot && !simpleObj && typeof path[path.length - 1] === 'string') && (
                        <h4 className="text-xs font-bold text-[#e0e0e0] capitalize mb-3 pb-2 border-b border-[#2a2a30] tracking-wide">
                            {formatLabel(String(path[path.length - 1]))}
                        </h4>
                    )}
                    
                    {/* Header for root sections */}
                    {isRoot && typeof path[path.length - 1] === 'string' && (
                        <h3 className="text-sm font-bold text-[#e0e0e0] capitalize flex items-center gap-2 pb-2 border-b border-[#2a2a30] tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {formatLabel(String(path[path.length - 1]))}
                        </h3>
                    )}
                    
                    {/* Render properties strictly stacked for narrow sidebars */}
                    <div className="flex flex-col gap-4 w-full">
                        {Object.keys(value).map((key) => renderNode([...path, key], value[key], depth + 1))}
                    </div>
                </div>
            )
        }

        // Handle primitives (Strings, Numbers, Booleans)
        const labelName = typeof path[path.length - 1] === 'number' ? `Value` : String(path[path.length - 1])
        const isTextArea = typeof value === "string" && (value.length > 50 || ['description', 'bio', 'summary', 'content', 'url', 'link'].some(w => labelName.toLowerCase().includes(w)));
        
        return (
            <div key={path.join('.')} className="space-y-1.5 flex flex-col w-full">
                {typeof path[path.length - 1] !== 'number' && (
                    <label className="text-[11px] font-semibold text-muted-foreground capitalize ml-0.5">
                        {formatLabel(labelName)}
                    </label>
                )}
                
                {isTextArea ? (
                    <textarea 
                        value={value}
                        onChange={(e) => handleNestedChange(path, e.target.value)}
                        placeholder={`Enter ${formatLabel(labelName).toLowerCase()}...`}
                        className="w-full bg-[#0d0d10] border border-[#2a2a30] rounded-lg p-2.5 text-[13px] leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[#e0e0e0] transition-all min-h-[85px] resize-y"
                    />
                ) : typeof value === "boolean" ? (
                    <select 
                        value={value ? "true" : "false"}
                        onChange={(e) => handleNestedChange(path, e.target.value === "true")}
                        className="w-full bg-[#0d0d10] border border-[#2a2a30] rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[#e0e0e0] appearance-none cursor-pointer outline-none"
                    >
                        <option value="true">Enabled (True)</option>
                        <option value="false">Disabled (False)</option>
                    </select>
                ) : (
                    <input 
                        type={typeof value === 'number' ? 'number' : 'text'} 
                        value={value}
                        onChange={(e) => handleNestedChange(path, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={`Enter ${formatLabel(labelName).toLowerCase()}...`}
                        className="w-full bg-[#0d0d10] border border-[#2a2a30] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[#e0e0e0] transition-all"
                    />
                )}
            </div>
        );
    }

    // Helper to deeply update state
    const handleNestedChange = (path: (string | number)[], newValue: any) => {
        setFormData((prev: any) => {
            if (!prev) return prev;
            const newState = JSON.parse(JSON.stringify(prev)); // Deep clone
            let current = newState;
            
            for (let i = 0; i < path.length - 1; i++) {
                const key = path[i];
                if (key !== undefined) current = current[key as keyof typeof current];
            }
            
            const lastKey = path[path.length - 1];
            if (lastKey !== undefined) current[lastKey as keyof typeof current] = newValue;
            return newState;
        });
    }

    const handleAddArrayItem = (path: (string | number)[]) => {
        setFormData((prev: any) => {
            if (!prev) return prev;
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            
            // Navigate to array
            for (let i = 0; i < path.length; i++) {
                const key = path[i];
                if (key !== undefined) current = current[key as keyof typeof current];
            }
            
            // Determine structure of new item based on first element (if exists)
            let newItem: any = {};
            if (Array.isArray(current) && current.length > 0) {
                // Empty the values of the template object
                if (typeof current[0] === 'object' && current[0] !== null) {
                    newItem = Object.keys(current[0]).reduce((acc, key) => {
                        acc[key] = Array.isArray(current[0][key]) ? [] : typeof current[0][key] === 'string' ? "" : null;
                        return acc;
                    }, {} as any);
                } else if (typeof current[0] === 'string') {
                    newItem = "";
                }
            }
            
            if (Array.isArray(current)) current.push(newItem);
            return newState;
        });
    }

    const handleRemoveArrayItem = (path: (string | number)[], indexToRemove: number) => {
        setFormData((prev: any) => {
            if (!prev) return prev;
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            
            // Navigate to array
            for (let i = 0; i < path.length; i++) {
                const key = path[i];
                if (key !== undefined) current = current[key as keyof typeof current];
            }
            
            if (Array.isArray(current)) current.splice(indexToRemove, 1);
            return newState;
        });
    }

    return (
        <div className="h-full w-full flex flex-col bg-[#0b0b0e] overflow-hidden text-[#e0e0e0]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1c1c22] shrink-0 bg-[#0d0d10]">
                <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Portfolio Editor</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#121216] border border-[#2a2a30] hover:border-violet-500/50 hover:bg-[#1a1a20] rounded-md text-[10px] font-bold uppercase tracking-widest text-[#e0e0e0] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400 " />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5 text-violet-400 group-hover:text-violet-300" />
                        )}
                        <span className="hidden sm:inline">{isGenerating ? 'Auto-filling...' : 'Auto-fill with AI'}</span>
                        <span className="sm:hidden">AI</span>
                    </button>
                    
                    <button 
                        onClick={handleSave}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save & Apply</span>
                        <span className="sm:hidden">Save</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Dynamic Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
                <div className="bg-[#0b0b0e] rounded-xl">
                    {Object.keys(formData).map((key) => renderNode([key], formData[key]))}
                </div>
            </div>
        </div>
    )
}

