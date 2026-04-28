"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    Files,
    Settings,
    User,
    LogOut,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Files, label: "Templates", href: "/templates" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/stores/authStore"
import { useRouter } from "next/navigation"

export const Sidebar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const clearAuth = useAuthStore((state) => state.clearAuth)

    const handleLogout = async () => {
        try {
            await authService.logout()
            clearAuth()
            router.push("/")
        } catch (err) {
            console.error("LOGOUT_ERROR:", err)
            clearAuth() // Clear anyway
            router.push("/")
        }
    }

    return (
        <aside className="fixed left-6 top-24 bottom-6 w-64 hidden xl:block">
            <div className="h-full clay-card flex flex-col p-4">
                <div className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                            >
                                <div className={cn(
                                    "group flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                                    isActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}>
                                    <div className="flex items-center space-x-3">
                                        <item.icon className={cn("w-5 h-5", isActive ? "text-purple-400" : "")} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {isActive && (
                                        <motion.div layoutId="active" className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>

                <div className="pt-4 border-t border-white/5 mt-4">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}

