"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { authService } from "@/services/auth.service"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderIcon, HardDriveIcon, ShieldCheckIcon, AlertCircleIcon } from "lucide-react"
import { useSnackbar } from "notistack"
import { motion, AnimatePresence } from "framer-motion"

export function WorkspaceDialog() {
    const { user, setAuth, accessToken } = useAuthStore()
    const { isWorkspaceDialogOpen, openWorkspaceDialog, closeWorkspaceDialog } = useSettingsStore()
    const { enqueueSnackbar } = useSnackbar()
    const [path, setPath] = useState("")
    const [isTesting, setIsTesting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Initial setup prompt
        if (user && !user.workspacePath) {
            openWorkspaceDialog()
        }
        
        // Populate path if it exists
        if (user?.workspacePath) {
            setPath(user.workspacePath)
        }
    }, [user, openWorkspaceDialog])

    const handleSave = async () => {
        if (!path.trim()) {
            setError("Please provide a valid absolute path.")
            return
        }

        setIsTesting(true)
        setError(null)

        try {
            const updatedUser = await authService.updateWorkspace(path)
            if (accessToken) {
                setAuth(updatedUser, accessToken)
            }
            enqueueSnackbar("Workspace configured successfully", { variant: "success" })
            closeWorkspaceDialog()
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || err.message || "Failed to configure workspace"
            setError(msg)
            enqueueSnackbar(msg, { variant: "error" })
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <Dialog open={isWorkspaceDialogOpen} onOpenChange={(open) => {
            // Prevent closing if no workspace is set
            if (!user?.workspacePath) return
            if (!open) closeWorkspaceDialog()
            else openWorkspaceDialog()
        }}>
            <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-primary/20 shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                            <HardDriveIcon className="w-5 h-5 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight">Configure Workspace</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground/80 leading-relaxed pt-2">
                        To store your project instances locally, we need a dedicated workspace directory. 
                        Please provide an <strong>absolute path</strong> on your system.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 ml-1">
                            Local Storage Path
                        </label>
                        <div className="relative group">
                            <FolderIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="C:\Users\Name\Portfolios" 
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                className="pl-10 bg-muted/30 border-primary/10 focus:border-primary/40 transition-all font-mono text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 italic ml-1 flex items-center gap-1">
                            <ShieldCheckIcon className="w-3 h-3" />
                            We'll verify disk permissions before saving.
                        </p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-3 mt-2"
                            >
                                <AlertCircleIcon className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                                <p className="text-xs text-destructive leading-tight font-medium">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleSave} 
                        disabled={isTesting || !path.trim()}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wider uppercase h-11 transition-all shadow-lg shadow-primary/20"
                    >
                        {isTesting ? (
                            <span className="flex items-center gap-2">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                />
                                Testing Permissions...
                            </span>
                        ) : "Establish Workspace"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

