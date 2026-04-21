"use client"

import { Briefcase, MapPin, AlignLeft } from "lucide-react"
import { SettingsSection } from "./SettingsSection"
import { userProfile as staticProfile } from "@/data/userProfile"

export const ProfessionalIdentitySection = () => {
    return (
        <SettingsSection
            title="Professional Identity"
            description="This information directly populates the header and 'About' sections of your portfolios."
            icon={Briefcase}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Professional Title</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                defaultValue={staticProfile.title}
                                className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Location</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                defaultValue={staticProfile.location}
                                className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Professional Summary / Bio</label>
                    <div className="relative group">
                        <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <textarea
                            rows={4}
                            defaultValue={staticProfile.bio}
                            className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                        />
                        <div className="absolute bottom-4 right-4 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            {staticProfile.bio.length} / 500 characters
                        </div>
                    </div>
                </div>
            </div>
        </SettingsSection>
    )
}

