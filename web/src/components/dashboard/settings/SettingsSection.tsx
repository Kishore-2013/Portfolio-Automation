"use client"

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface SettingsSectionProps {
    title: string
    description: string
    icon?: LucideIcon
    children: ReactNode
}

export const SettingsSection = ({
    title,
    description,
    icon: Icon,
    children
}: SettingsSectionProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 border-b border-border/50 first:pt-0 last:border-0">
            {/* Left side: Info */}
            <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-5 h-5 text-primary" />}
                    <h3 className="font-bold text-lg text-foreground uppercase tracking-tight">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {description}
                </p>
            </div>

            {/* Right side: Form Card */}
            <div className="lg:col-span-8">
                <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                    {children}
                </div>
            </div>
        </div>
    )
}

