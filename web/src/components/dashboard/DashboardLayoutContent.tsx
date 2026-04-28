"use client"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar"
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient"
import { WorkspaceDialog } from "@/components/dashboard/WorkspaceDialog"

export function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isBuilderPage = pathname === "/dashboard/portfolios/builder"

    if (isBuilderPage) {
        return (
            <DashboardLayoutClient>
                <WorkspaceDialog />
                {children}
            </DashboardLayoutClient>
        )
    }

    return (
        <DashboardLayoutClient>
            <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col select-none relative">
                <WorkspaceDialog />
                <DashboardNavbar />
                <div className="flex flex-1 overflow-hidden">
                    <DashboardSidebar />
                    <div className="flex-1 flex flex-col ml-20 relative overflow-hidden h-full">
                        <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none z-0" />
                        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 pt-20">
                            <div className="min-h-full flex flex-col">
                                <div className="flex-1">
                                    {children}
                                </div>
                                <footer className="px-12 py-10 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-auto">
                                    <p>© 2026 Portfolio Automation Tool. All rights reserved.</p>
                                    <div className="flex items-center gap-12">
                                        <a href="#" className="hover:text-primary transition-all hover:tracking-widest">Docs</a>
                                        <a href="#" className="hover:text-primary transition-all hover:tracking-widest">Privacy</a>
                                        <a href="#" className="hover:text-primary transition-all hover:tracking-widest">Support</a>
                                    </div>
                                </footer>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </DashboardLayoutClient>
    )
}

