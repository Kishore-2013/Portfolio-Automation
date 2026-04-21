"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tipOfTheWeek as tip } from "@/data/dashboard"
import Image from "next/image"
import React, { memo } from "react"

export const TipCard = memo(() => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="clay-surface p-10 relative overflow-hidden group bg-gradient-to-br from-card to-background/50"
        >
            <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />

            <div className="md:flex items-center gap-16 relative z-10">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/10 text-primary self-start border border-primary/10 shadow-sm">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tip.badge}</span>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tighter leading-[1.1]">
                            {tip.title.split(tip.highlight)[0]}
                            <span className="text-primary italic">{tip.highlight}</span>
                            {tip.title.split(tip.highlight)[1]}
                        </h2>

                        <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                            {tip.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Button className="bg-foreground text-background hover:bg-foreground/90 font-black px-10 h-14 rounded-2xl shadow-xl shadow-foreground/5 transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-widest">
                            Explore Best Practices
                        </Button>
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted font-bold h-14 px-8 rounded-2xl group/btn">
                            Dismiss tips
                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Button>
                    </div>
                </div>

                <div className="hidden lg:block w-80 aspect-square relative rounded-[2rem] overflow-hidden border border-border shadow-2xl p-4 bg-muted/20">
                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                        <Image
                            src={tip.imageUrl}
                            alt="Tip illustration"
                            width={320}
                            height={320}
                            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-in-out scale-110 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
})

