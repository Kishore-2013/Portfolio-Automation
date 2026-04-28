"use client"

import { User, Mail } from "lucide-react"
import { SettingsSection } from "./SettingsSection"
import { useAuthStore } from "@/stores/authStore"
import { userProfile as staticProfile } from "@/data/userProfile"

export const PersonalDetailsSection = () => {
    const { user } = useAuthStore()

    return (
        <SettingsSection
            title="Personal Details"
            description="Basic contact and identity information used for account management."
            icon={User}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            defaultValue={user?.name || staticProfile.name}
                            className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-border/80 transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            defaultValue={user?.email || staticProfile.email}
                            className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-border/80 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>
        </SettingsSection>
    )
}

