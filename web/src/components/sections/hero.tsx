"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, UploadCloud, Code2, Layout, Sparkles, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const Hero = memo(() => {
    return (
        <section className="relative pt-40 md:pt-48 pb-24 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-md text-[10px] md:text-xs font-bold text-primary mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    AI-POWERED PORTFOLIO ENGINE
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    style={{ willChange: "transform, opacity" }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mb-8 text-foreground"
                >
                    Generate a <span className="text-primary">Professional</span> <br />
                    <span className="italic font-light">Site</span> from your Resume
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-2xl text-base md:text-lg text-muted-foreground font-medium leading-relaxed mb-12"
                >
                    Skip the coding. Upload your PDF and get a
                    production-ready, SEO-optimized website in 60 seconds.
                </motion.p>

                {/* Action CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
                    <Link href="/templates">
                        <Button className="px-10 py-6 bg-primary text-white text-base font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all hover:scale-105 h-auto active:scale-95">
                            Generate Now <ChevronRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="outline" className="px-10 py-6 border-border bg-background/50 text-base font-bold rounded-xl hover:bg-muted transition-all active:scale-95 h-auto">
                            Sign In
                        </Button>
                    </Link>
                </div>

                {/* Social Proof */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col items-center gap-3 mb-24"
                >
                    <div className="flex -space-x-3 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="inline-block h-8 w-8 rounded-full border-2 border-background bg-muted shadow-md overflow-hidden relative">
                                <Image
                                    src={`https://i.pravatar.cc/150?u=${i + 15}`}
                                    alt="User"
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-white text-[8px] font-black shadow-md">
                            10k+
                        </div>
                    </div>
                    <p className="text-muted-foreground font-bold text-[10px] md:text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        Trusted by developers from <span className="text-foreground">Google, Meta & Vercel</span>
                    </p>
                </motion.div>

                {/* Mockup Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{ willChange: "transform, opacity" }}
                    className="w-full max-w-4xl mx-auto"
                >
                    <div className="clay-card p-3 bg-background/20 border-border shadow-xl overflow-hidden group">
                        <div className="bg-background rounded-xl overflow-hidden border border-border aspect-[16/10] flex flex-col shadow-inner transition-transform group-hover:scale-[1.005] duration-700">
                            {/* Browser Header */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                </div>
                                <div className="bg-muted px-4 py-1 rounded-lg text-[8px] text-muted-foreground font-mono">applywizz.ai/builder</div>
                                <div className="flex gap-3 text-muted-foreground">
                                    <Code2 className="w-3.5 h-3.5" />
                                    <Layout className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            {/* Internal App View */}
                            <div className="flex-1 relative overflow-hidden bg-background group-hover:scale-[1.02] transition-transform duration-1000">
                                <Image
                                    src="/hero-banner.png"
                                    alt="Dashboard Preview"
                                    fill
                                    className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                                
                                {/* Overlay floating elements */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 border border-dashed border-primary/40 rounded-2xl bg-primary/5 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
                                    <UploadCloud className="w-10 h-10 text-primary mb-3" />
                                    <p className="text-xs font-black tracking-tight text-foreground uppercase">AI Processing...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
})

Hero.displayName = "Hero"

