"use client"

import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export const SettingsActions = () => {
    return (
        <div className="fixed bottom-0 left-20 right-0 bg-background/80 backdrop-blur-xl border-t border-border px-12 py-6 flex items-center justify-end gap-4 z-50">
            <Button variant="ghost" className="rounded-xl px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground h-12 transition-all flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30 rounded-xl px-10 font-black text-[10px] uppercase tracking-[0.2em] h-12 transition-all flex items-center gap-2 active:scale-95 group">
                <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                Save Changes
            </Button>
        </div>
    )
}

