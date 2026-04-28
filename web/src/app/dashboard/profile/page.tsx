"use client"

import { ProfilePhotoSection } from "@/components/dashboard/settings/ProfilePhotoSection"
import { PersonalDetailsSection } from "@/components/dashboard/settings/PersonalDetailsSection"
import { ProfessionalIdentitySection } from "@/components/dashboard/settings/ProfessionalIdentitySection"
import { SecurityAccessSection } from "@/components/dashboard/settings/SecurityAccessSection"
import { AdvancedSettingsSection } from "@/components/dashboard/settings/AdvancedSettingsSection"
import { SettingsActions } from "@/components/dashboard/settings/SettingsActions"

export default function ProfilePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-8 py-10 pb-32">
            {/* Header */}
            <header className="mb-12 space-y-2">
                <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground text-sm font-medium">Manage your profile information, professional identity, and security preferences.</p>
            </header>

            {/* Content Sections */}
            <div className="space-y-0">
                <ProfilePhotoSection />
                <div className="mt-10 space-y-0">
                    <PersonalDetailsSection />
                    <ProfessionalIdentitySection />
                    <SecurityAccessSection />
                    <AdvancedSettingsSection />
                </div>
            </div>

            {/* Footer Actions */}
            <SettingsActions />
        </div>
    )
}

