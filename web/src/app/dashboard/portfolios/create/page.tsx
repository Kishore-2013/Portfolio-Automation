"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { StepIndicator } from "@/components/portfolio/StepIndicator"
import { TemplateSelectionStep } from "@/components/portfolio/TemplateSelectionStep"
import { ResumeUploadStep } from "@/components/portfolio/ResumeUploadStep"
import { ParsingStep } from "@/components/portfolio/ParsingStep"
import { AIProcessingState } from "@/components/portfolio/AIProcessingState"
import { FileText, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTemplateStore, Template } from "@/stores/templateStore"
import { TemplateDTO } from "@/shared/types"
import { simulateResumeParsing, simulatePortfolioGeneration } from "@/services/simulation"
import { useFileStore } from "@/components/builder/fileStore"
import { projectService } from "@/services/project.service"
import { useSnackbar } from "notistack"

export default function CreatePortfolioPage() {
    const router = useRouter()
    const { enqueueSnackbar } = useSnackbar()
    const { selectedTemplate, setSelectedTemplate, clearSelectedTemplate } = useTemplateStore()
    const parsedResume = useFileStore(s => s.parsedResume)
    const storeSetResumeFile = useFileStore(s => s.setResumeFile)
    const performParsing = useFileStore(s => s.performParsing)
    const generateSuggestions = useFileStore(s => s.generateSuggestions)
    const createProject = useFileStore(s => s.createProject)

    const [currentStep, setCurrentStep] = useState(1) // Always start at 1 and decide in useEffect
    const [isProcessing, setIsProcessing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [creationError, setCreationError] = useState<string | null>(null)

    const steps = ["Template", "Resume", "Parsing"]

    const handleTemplateSelect = (template: TemplateDTO) => {
        setSelectedTemplate({
            ...template,
            previewImage: template.thumbUrl || "/placeholder.png"
        } as Template)
        setCurrentStep(2)
    }

    const handleResumeUpload = async (file: File) => {
        setIsProcessing(true)
        setCreationError(null)

        try {
            // STEP 2 & 3: Upload and Parse
            await storeSetResumeFile(file)
            await performParsing()
            
            setIsProcessing(false)
            setCurrentStep(3)
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || "Logic matching engine failed. Please try a different resume format."
            setCreationError(msg)
            enqueueSnackbar(msg, { variant: "error" })
            setIsProcessing(false)
        }
    }

    const handleFinish = async () => {
        if (!selectedTemplate) return

        setIsGenerating(true)
        setCreationError(null)

        try {
            // STEP 3.5: Initialize Instance with Template Files
            const project = await createProject(
                selectedTemplate.id, 
                selectedTemplate.name
            )

            // STEP 4: Information Matching (Generate Recommendations)
            generateSuggestions()

            // Redirect to builder with projectId query param
            router.push(`/dashboard/portfolios/builder?projectId=${project.id}`)
        } catch (error: any) {
            console.error("FINISH_ERROR:", error);
            const msg = error.response?.data?.message || error.message || "Blueprint assembly failed. Our servers might be busy."
            setCreationError(msg)
            enqueueSnackbar(msg, { variant: "error" })
            // We keep setIsGenerating(true) so the error UI stays visible
        }
    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get('templateId');
        
        console.log("INITIALIZING_FLOW:", { templateId, currentStep, hasSelected: !!selectedTemplate });

        const init = async () => {
            if (templateId) {
                console.log("DETECTION: Template ID found in URL. Loading...");
                try {
                    const templates = await projectService.getTemplates()
                    const found = templates.find((t: TemplateDTO) => t.id === templateId)
                    if (found) {
                        setSelectedTemplate({
                            ...found,
                            previewImage: found.thumbUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1280&auto=format&fit=crop"
                        } as Template)
                        setCurrentStep(2)
                        return
                    }
                } catch (e) {
                    console.error("Failed to fetch template from URL", e)
                }
            } else if (!templateId && currentStep !== 1) {
                console.log("DETECTION: No Template ID and not on Step 1. Resetting...");
                clearSelectedTemplate()
                setCurrentStep(1)
            } else if (!templateId && !selectedTemplate && currentStep !== 1) {
                setCurrentStep(1)
            }
        }
        
        init()
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [setSelectedTemplate, clearSelectedTemplate]) // Removed currentStep from deps to prevent loops

    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    return (
        <div className={cn(
            "relative p-4 lg:p-8 mx-auto min-h-screen transition-all duration-700 ease-in-out",
            currentStep === 3 ? "max-w-screen-2xl" : "max-w-[1400px]"
        )}>
            {/* Ultra-Premium Background Elements */}
            <div className="absolute inset-0 grid-pattern opacity-[0.05] pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(theme(colors.background),0.8)_80%)] pointer-events-none" />

            <AnimatePresence mode="wait">
                {(currentStep !== 3 || isGenerating) && !isProcessing && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        className="text-center space-y-2 pt-16 pb-8"
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "80px" }}
                            className="h-1 bg-primary mx-auto mb-6 rounded-full shadow-[0_0_15px_rgba(theme(colors.primary),0.5)]"
                        />
                        <motion.h1
                            key={currentStep}
                            className="text-4xl md:text-6xl font-black tracking-[calc(-0.05em)] uppercase italic leading-none"
                        >
                            {currentStep === 1 && <><span className="text-primary italic">Select</span> Architect</>}
                            {currentStep === 2 && <><span className="text-primary italic">Feed</span> Neural Data</>}
                        </motion.h1>
                        <motion.p
                            key={`p-${currentStep}`}
                            className="text-muted-foreground text-[10px] md:text-sm font-black uppercase tracking-[0.4em] opacity-40"
                        >
                            {currentStep === 1 && "The Foundation of Digital Identity"}
                            {currentStep === 2 && "Universal Resume Parsing Engine"}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Processing Header */}
            {(isProcessing || isGenerating) && (
                <div className="text-center space-y-4 pt-12 pb-12">
                    <motion.h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                        {isGenerating ? "Generating Portfolio..." : "Processing Logic..."}
                    </motion.h1>
                    <motion.p className="text-muted-foreground text-lg md:text-xl font-medium">
                        {isGenerating
                            ? "Assembling components and injecting your professional story."
                            : "Our neural engine is analyzing your professional data."}
                    </motion.p>
                </div>
            )}

            {currentStep !== 3 && !isProcessing && !isGenerating && (
                <div className="py-8 max-w-md mx-auto">
                    <StepIndicator currentStep={currentStep} steps={steps} />
                </div>
            )}

            <main className={cn(
                "flex-1 flex flex-col items-center",
                currentStep === 3 && !isGenerating ? "pt-0" : "pt-8"
            )}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep + (isProcessing ? "-proc" : "") + (isGenerating ? "-gen" : "")}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        {isProcessing || isGenerating ? (
                            <AIProcessingState 
                                isError={!!creationError}
                                error={creationError}
                                onRetry={handleFinish}
                                title={isGenerating ? "Assembling Portfolio..." : "Processing Logic..."}
                                subtitle={isGenerating 
                                    ? "Injecting your professional story into the blueprint."
                                    : "Our neural engine is analyzing your professional data."
                                }
                            />
                        ) : (
                            <>
                                {currentStep === 1 && (
                                    <TemplateSelectionStep onContinue={(tpl) => handleTemplateSelect(tpl as any)} />
                                )}
                                {currentStep === 2 && (
                                    <ResumeUploadStep
                                        onContinue={(file) => handleResumeUpload(file)}
                                        onBack={handleBack}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <ParsingStep
                                        data={parsedResume}
                                        onFinish={handleFinish}
                                    />
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Info / Links: Hide on Step 3 as it has its own sticky footer */}
            {currentStep !== 3 && (
                <div className="pt-20 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-12">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Auto-saving draft...</p>
                            <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="h-full w-1/2 bg-primary/30"
                                />
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Session ID: <span className="text-foreground">PAT-882-QX</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <button 
                            onClick={() => enqueueSnackbar("Template source is available in the connected Git repository.", { variant: "info" })}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
                        >
                            <Search className="w-3.5 h-3.5" />
                            View Template Source
                        </button>
                        <button 
                            onClick={() => enqueueSnackbar("Parsing guidelines can be found in our documentation portal.", { variant: "info" })}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Parsing Guidelines
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

