"use client"

import { Zap, Download, Trash2 } from "lucide-react"
import { SettingsSection } from "./SettingsSection"
import { Button } from "@/components/ui/button"

export const AdvancedSettingsSection = () => {
    return (
        <SettingsSection
            title="Advanced"
            description="Manage your data and account visibility."
            icon={Zap}
        >
            <div className="space-y-4">
                {/* Export Card */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground">Export Workspace Data</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm">
                            Download all your portfolio projects and code as a JSON archive.
                        </p>
                    </div>
                    <Button variant="outline" className="shrink-0 border-border bg-background hover:bg-muted text-foreground rounded-xl px-5 font-black text-[10px] uppercase tracking-widest h-10 transition-all flex items-center gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </Button>
                </div>

                {/* Deactivate Card */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-destructive/5 border border-destructive/20 group hover:border-destructive/40 transition-colors">
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm text-destructive">Deactivate Account</h4>
                        <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-sm">
                            Permanently remove your data and access to portfolios.
                        </p>
                    </div>
                    <Button variant="destructive" className="shrink-0 rounded-xl px-5 font-black text-[10px] uppercase tracking-widest h-10 transition-all active:scale-95 shadow-lg shadow-destructive/20">
                        Deactivate
                    </Button>
                </div>
            </div>
        </SettingsSection>
    )
}

