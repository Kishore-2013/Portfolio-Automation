"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck, Globe, Search } from "lucide-react"

export const CTA = memo(() => {
    return (
        <section className="py-32 px-6 relative overflow-hidden bg-transparent">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                style={{ willChange: "transform, opacity" }}
                className="max-w-4xl mx-auto text-center space-y-10 relative z-10"
            >
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-foreground">
                    Ready to showcase <br /> <span className="text-primary italic">your talent?</span>
                </h2>

                <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                    Join 25,000+ developers who built their professional websites with us. No credit card required.
                </p>

                <div className="flex flex-col items-center gap-10">
                    <Link href="/register">
                        <Button className="px-12 py-7 bg-primary text-white text-xl font-bold rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.4)] transition-all hover:scale-110 active:scale-95 h-auto">
                            Generate My Portfolio Now
                        </Button>
                    </Link>

                    <div className="flex flex-wrap items-center justify-center gap-10 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                        <motion.span
                            whileHover={{ scale: 1.05, color: "var(--foreground)" }}
                            className="flex items-center gap-2 transition-colors"
                        >
                            <ShieldCheck className="w-4 h-4 text-primary" /> SSL Included
                        </motion.span>
                        <motion.span
                            whileHover={{ scale: 1.05, color: "var(--foreground)" }}
                            className="flex items-center gap-2 transition-colors"
                        >
                            <Globe className="w-4 h-4 text-primary" /> Custom Domain
                        </motion.span>
                        <motion.span
                            whileHover={{ scale: 1.05, color: "var(--foreground)" }}
                            className="flex items-center gap-2 transition-colors"
                        >
                            <Search className="w-4 h-4 text-primary" /> SEO Optimized
                        </motion.span>
                    </div>
                </div>
            </motion.div>
        </section>
    )
})

CTA.displayName = "CTA"

