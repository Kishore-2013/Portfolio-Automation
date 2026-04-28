"use client"

import { motion } from "framer-motion"
import { Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import React, { memo } from "react"

export const CreatePortfolioCard = memo(({ delay = 0 }: { delay?: number }) => {
    return (
        <Link href="/dashboard/portfolios/create" className="block h-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group aspect-[4/5] md:aspect-auto h-full min-h-[400px] rounded-[2.5rem] border-2 border-dashed border-primary/20 hover:border-primary hover:bg-primary/[0.03] transition-all flex flex-col items-center justify-center p-8 text-center space-y-6 active:scale-95 cursor-pointer"
            >
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-90 transition-all duration-500 shadow-xl shadow-primary/5">
                        <Plus className="w-8 h-8" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center shadow-lg shadow-amber-400/20 border-2 border-background animate-bounce-slow">
                        <Sparkles className="w-3 h-3 text-white" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-black text-xl tracking-tight">Generate New</h3>
                    <p className="text-sm text-muted-foreground max-w-[180px] font-medium leading-relaxed">
                        AI-powered generation from your latest resume.
                    </p>
                </div>
            </motion.div>
        </Link>
    )
})

