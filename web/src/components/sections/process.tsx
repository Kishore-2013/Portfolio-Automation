"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { UploadCloud, Layout, CheckCircle2, Rocket } from "lucide-react"

export const Process = memo(() => {
    const steps = [
        { icon: UploadCloud, title: "Upload Resume", desc: "Drag your latest resume or import your LinkedIn data." },
        { icon: Layout, title: "Select Theme", desc: "Browse styles that match your industry and personality." },
        { icon: CheckCircle2, title: "Confirm Data", desc: "Refine extracted info and add missing project links." },
        { icon: Rocket, title: "Launch Site", desc: "One-click deployment to your portfolio with a custom domain." }
    ]

    return (
        <section className="py-20 px-6 relative overflow-hidden bg-transparent">
            <div className="max-w-7xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-black mb-16 tracking-tight text-foreground"
                >
                    From Zero to Live in <span className="text-primary italic">4 Steps</span>
                </motion.h2>

                <div className="relative flex flex-col md:flex-row justify-between items-start gap-10 md:gap-0">
                    {/* Animated Connector Line */}
                    <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-[1px] overflow-hidden pointer-events-none">
                        <motion.div
                            initial={{ x: "-100%" }}
                            whileInView={{ x: "0%" }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            viewport={{ once: true }}
                            className="w-full h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                        />
                    </div>

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            style={{ willChange: "transform, opacity" }}
                            className="relative z-10 flex-1 flex flex-col items-center px-4 group"
                        >
                            {/* Step Icon Container */}
                            <div className="w-16 h-16 rounded-xl bg-background/50 border border-border flex items-center justify-center mb-6 shadow-sm relative transition-all duration-300 group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:scale-105">
                                <step.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] font-black border-2 border-background text-white">
                                    {i + 1}
                                </div>
                            </div>

                            <h3 className="text-lg font-black mb-2 tracking-tight text-foreground">{step.title}</h3>
                            <p className="text-muted-foreground text-xs font-medium leading-relaxed max-w-[180px]">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
})

Process.displayName = "Process"

