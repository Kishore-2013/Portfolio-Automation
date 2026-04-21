"use client"

import { motion } from "framer-motion"
import { templateStats as stats } from "@/data/templates"

export const TemplateStats = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        duration: 0.8, 
                        delay: i * 0.1,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="group relative overflow-hidden p-6 bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl transition-all duration-500 hover:border-primary/50 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] cursor-default"
                >
                    <div className="relative flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors duration-300">
                                {stat.label}
                            </p>
                            <p className="text-2xl font-black tracking-tighter">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                    
                    {/* Subtle Background Accent */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                        <stat.icon className="w-20 h-20" />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

