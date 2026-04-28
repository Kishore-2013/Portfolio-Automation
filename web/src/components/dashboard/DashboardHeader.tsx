"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"

export function DashboardHeader() {
    const { user } = useAuthStore()
    const firstName = user?.name?.split(' ')[0] || "User"

    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-4"
            >
                <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                        Welcome back, <span className="text-primary italic relative">
                            {firstName}!
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>
                    <span className="text-4xl md:text-6xl animate-bounce-slow">👋</span>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl leading-relaxed">
                    You have <span className="text-foreground font-bold">2 active portfolios</span> live and getting traffic. Your reach is up <span className="text-emerald-500 font-bold">12.5%</span> this week.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Link href="/dashboard/portfolios/create" className="block">
                    <Button className="bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/30 font-black px-10 h-16 rounded-2xl transition-all hover:scale-105 active:scale-95 gap-3 group text-base uppercase tracking-widest shadow-xl shadow-primary/10">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                        New Portfolio
                    </Button>
                </Link>
            </motion.div>
        </div>
    )
}

