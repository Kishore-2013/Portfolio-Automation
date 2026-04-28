"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { UploadCloud, Bolt, Palette, Code2 } from "lucide-react"

export const Features = memo(() => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }

    return (
        <section className="py-20 px-6 bg-transparent">
            <div className="max-w-7xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-foreground"
                >
                    Built for <span className="text-primary italic">Efficiency</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: true }}
                    className="text-muted-foreground font-medium mb-16 text-base md:text-lg max-w-xl mx-auto"
                >
                    Everything you need to ship your personal brand in record time.
                </motion.p>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {[
                        { icon: UploadCloud, title: "Resume Upload", desc: "Our AI engine extracts skills, projects, and history from any PDF instantly." },
                        { icon: Bolt, title: "Instant Gen", desc: "Automatically map resume data to optimized SEO-ready React components." },
                        { icon: Palette, title: "Template Gallery", desc: "Choose from a curated collection of designer-made templates optimized for conversion." },
                        { icon: Code2, title: "Live Editor", desc: "Tweak styles and content in real-time with our intuitive visual interface." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="clay-card p-8 flex flex-col items-start text-left bg-background/40 border border-border transition-all duration-300 hover:shadow-lg group relative overflow-hidden"
                        >
                            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 mb-6 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-black mb-2.5 tracking-tight text-foreground">{feature.title}</h3>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>

                            {/* Background flare */}
                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
})

Features.displayName = "Features"

