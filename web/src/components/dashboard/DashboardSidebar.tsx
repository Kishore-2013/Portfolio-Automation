"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
    LayoutGrid,
    Layers,
    Palette,
    History,
    User,
    LogOut,
    Settings,
    ShieldCheck,
    HardDriveIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import React, { useState, memo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { authService } from "@/services/auth.service"
import { useRouter } from "next/navigation"

const navItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
    { icon: Layers, label: "Portfolios", href: "/dashboard/portfolios" },
    { icon: Palette, label: "Templates", href: "/dashboard/templates" },
    { icon: History, label: "History", href: "/dashboard/history" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: ShieldCheck, label: "Admin", href: "/dashboard/admin/templates" },
]

export const DashboardSidebar = memo(() => {
    const pathname = usePathname()
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false)
    const { user, clearAuth } = useAuthStore()
    const { openWorkspaceDialog } = useSettingsStore()

    const handleLogout = async () => {
        try {
            await authService.logout()
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            clearAuth()
            router.push("/login")
        }
    }

    return (
        <aside
            className="fixed left-0 top-20 bottom-0 z-50 flex flex-col items-center py-6 bg-background border-r border-border transition-all duration-300 ease-in-out w-20 hover:w-64 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <nav className="flex-1 space-y-3 px-3 w-full pt-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/")
                    return (
                        <Link key={item.href} href={item.href} className="block group/link relative">
                            <div className={cn(
                                "flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                isActive
                                    ? "clay-surface bg-primary/10 text-primary shadow-sm shadow-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}>
                                <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                                    <item.icon className={cn("w-5 h-5 transition-transform group-hover/link:scale-110", isActive ? "text-primary" : "")} />
                                </div>

                                <span className={cn(
                                    "font-bold text-sm whitespace-nowrap transition-all duration-300",
                                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 invisible group-hover:visible"
                                )}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-line"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                                    />
                                )}
                            </div>

                            {/* Tooltip for collapsed state - only visible when NOT hovered as a whole */}
                            {!isHovered && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/link:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl whitespace-nowrap">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="pt-6 border-t border-border mt-auto space-y-4 py-6 px-3 w-full">
                <button 
                    onClick={openWorkspaceDialog}
                    className="flex items-center gap-4 p-2.5 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all w-full group/settings overflow-hidden relative"
                >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <HardDriveIcon className="w-5 h-5 text-primary group-hover/settings:rotate-12 transition-transform" />
                    </div>
                    <div className={cn(
                        "text-left whitespace-nowrap transition-all duration-300",
                        isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 invisible group-hover:visible"
                    )}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Workspace</p>
                    </div>
                </button>
                <button className="flex items-center gap-4 p-2.5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all w-full overflow-hidden">
                    <div className="w-8 h-8 rounded-xl overflow-hidden border border-border shadow-sm flex-shrink-0 bg-primary/10 flex items-center justify-center">
                        {user?.name ? (
                            <span className="text-[10px] font-black">{user.name.split(' ').map(n => n[0]).join('')}</span>
                        ) : (
                            <User className="w-4 h-4 text-primary" />
                        )}
                    </div>
                    <div className={cn(
                        "text-left whitespace-nowrap transition-all duration-300",
                        isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}>
                        <p className="text-xs font-bold leading-none">{user?.name || "User"}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Free Member</p>
                    </div>
                </button>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-4 p-3 rounded-2xl text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all w-full group/logout overflow-hidden"
                >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className={cn(
                        "font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                        isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}>
                        Sign Out
                    </span>
                </button>
            </div>
        </aside>
    )
})

