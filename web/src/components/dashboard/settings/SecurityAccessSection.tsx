"use client"

import { Shield, Lock } from "lucide-react"
import { SettingsSection } from "./SettingsSection"
import { Button } from "@/components/ui/button"

export const SecurityAccessSection = () => {
    return (
        <SettingsSection
            title="Security & Access"
            description="Keep your account secure by using a strong password."
            icon={Shield}
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Current Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">New Password</label>
                        <input
                            type="password"
                            placeholder="New password"
                            className="w-full bg-background border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm password"
                            className="w-full bg-background border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 font-black text-[10px] uppercase tracking-widest h-11 transition-all active:scale-95 shadow-lg">
                        Update Password
                    </Button>
                </div>
            </div>
        </SettingsSection>
    )
}

