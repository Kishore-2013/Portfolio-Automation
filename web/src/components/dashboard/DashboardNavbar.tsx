"use client"

import React, { memo } from "react"
import { Search, Bell, Command, Settings, Sparkles, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useAuthStore } from "@/stores/authStore"

export const DashboardNavbar = memo(() => {
    const clearAuth = useAuthStore(s => s.clearAuth)

    return (
        <nav className="h-20 border-b border-border bg-background/80 backdrop-blur-xl absolute top-0 left-0 right-0 px-8 flex items-center justify-between z-[60]">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex items-center gap-3 group transition-transform active:scale-95">
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent hidden sm:block">
                        ApplyWizz
                    </span>
                </Link>

                <div className="h-8 w-px bg-border hidden lg:block" />

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1">Overview</Link>
                    <Link href="/analytics" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1">Analytics</Link>
                    <Link href="/support" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1">Support</Link>
                </div>
            </div>

            <div className="flex items-center gap-6 flex-1 justify-end">
                <div className="relative group max-w-sm w-full hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search projects..."
                        className="w-full bg-muted/30 border-none pl-12 h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all text-sm font-medium"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-background border border-border text-[10px] text-muted-foreground font-black tracking-tight shadow-sm">
                        <Command className="w-2.5 h-2.5" /> K
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="w-px h-6 bg-border mx-1" />
                    <button className="w-10 h-10 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border flex items-center justify-center relative transition-all group active:scale-95">
                        <Bell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background" />
                    </button>
                    <Link href="/dashboard/profile" className="w-10 h-10 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border flex items-center justify-center transition-all group active:scale-95">
                        <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:rotate-90 duration-500" />
                    </Link>
                    <button 
                        onClick={() => clearAuth()}
                        className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-all group active:scale-95"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4 text-red-500/60 group-hover:text-red-500" />
                    </button>
                </div>
            </div>
        </nav>
    )
})

