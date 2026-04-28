"use client"

import { motion } from "framer-motion"
import { Code2 } from "lucide-react"

export const CustomLayoutBanner = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden p-16 lg:p-24 bg-card/30 backdrop-blur-2xl border border-border/50 rounded-[4rem] text-center space-y-10 mt-32 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.4)]"
        >
            {/* Background elements */}
            <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4 group-hover:bg-blue-500/20 transition-colors duration-700" />

            <div className="relative z-10 space-y-8">
                <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-2xl group-hover:scale-110 transition-transform duration-500 shadow-primary/20">
                    <Code2 className="w-10 h-10" />
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight italic">
                        Bespoke <br/>
                        <span className="text-primary not-italic">Identity.</span>
                    </h2>
                    <p className="text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto opacity-70">
                        Our Enterprise plan allows for completely custom components and styling. Build a unique developer presence with our high-end design team.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                    <button className="h-18 px-12 bg-primary text-primary-foreground font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] flex items-center gap-3">
                        Contact Sales
                        <div className="w-2 h-2 rounded-full bg-primary-foreground animate-ping" />
                    </button>
                    <button className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group/btn">
                        View Custom Showcase
                        <div className="w-6 h-[2px] bg-muted-foreground/30 group-hover/btn:w-10 group-hover/btn:bg-primary transition-all duration-300" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

