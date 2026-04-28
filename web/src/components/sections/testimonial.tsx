"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { Bolt, Quote } from "lucide-react"
import Image from "next/image"

export const Testimonial = memo(() => {
    return (
        <section className="py-32 px-6 relative overflow-hidden bg-transparent">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                style={{ willChange: "transform, opacity" }}
                className="max-w-4xl mx-auto clay-card bg-primary p-12 md:p-16 relative overflow-hidden group shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
            >
                {/* Decorative Background Icon */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    style={{ willChange: "transform" }}
                    className="absolute -bottom-20 -right-20 pointer-events-none opacity-5"
                >
                    <Bolt className="w-96 h-96 text-white" />
                </motion.div>

                <div className="relative z-10 flex flex-col items-start gap-10">
                    <Quote className="w-12 h-12 text-white/20 -mb-6" />

                    <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-white/95">
                        "I had a live portfolio in exactly 42 seconds. This is hands-down the fastest way for developers to get their work online without touching a line of CSS."
                    </h2>

                    <div className="flex items-center gap-5 p-2 pr-6 rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all">
                        <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden shadow-lg relative">
                            <Image
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop"
                                alt="Sarah Drasner"
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-white leading-tight">Sarah Drasner</p>
                            <p className="text-white/60 font-black text-[10px] uppercase tracking-widest">Senior Software Engineer @ Google</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
})

Testimonial.displayName = "Testimonial"

