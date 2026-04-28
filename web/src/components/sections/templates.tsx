"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { templates } from "@/data/templates"
import Image from "next/image"

export const Templates = memo(() => {
    const featuredTemplates = templates.slice(0, 3)
    return (
        <section className="py-20 px-6 relative overflow-hidden bg-transparent">
            <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                <div className="text-left space-y-2">
                    <motion.h2
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black tracking-tight text-foreground"
                    >
                        World-Class Templates
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-muted-foreground font-medium text-sm md:text-base leading-relaxed max-w-lg"
                    >
                        Curated by top designers to ensure your work stands out.
                    </motion.p>
                </div>
                <div className="flex bg-muted/40 p-1 rounded-xl border border-border">
                    {["Minimal", "Developer", "Creative"].map((tab) => (
                        <button
                            key={tab}
                            className={`px-5 py-1.5 text-xs font-bold transition-all rounded-lg ${tab === "Developer" ? "bg-primary text-white shadow" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {featuredTemplates.map((template, i) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 0.99 }}
                        style={{ willChange: "transform, opacity" }}
                        className="group cursor-pointer"
                    >
                        <div className={`aspect-[4/3] rounded-2xl bg-muted/20 mb-4 border border-border overflow-hidden transition-all group-hover:border-primary/30 group-hover:shadow-md relative`}>
                            <Image
                                src={template.imageUrl}
                                alt={template.title}
                                width={400}
                                height={300}
                                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-bold tracking-tight text-foreground">{template.title}</h3>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{template.category} / {template.tags[0]}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full border border-primary/20 text-[9px] font-black text-primary bg-primary/5 uppercase">Pro</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <button className="text-primary text-xs font-black flex items-center gap-2 mx-auto hover:gap-3 transition-all group">
                    Browse all 50+ templates <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </section>
    )
})

Templates.displayName = "Templates"

