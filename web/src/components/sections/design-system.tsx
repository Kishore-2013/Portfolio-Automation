"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"

const colors = [
  { name: "Primary", hex: "#6366f1", bg: "bg-primary" },
  { name: "Secondary", hex: "#ec4899", bg: "bg-secondary" },
  { name: "Accent", hex: "#f59e0b", bg: "bg-accent" },
  { name: "Background", hex: "#0a0a0a", bg: "bg-background border border-border" },
  { name: "Muted", hex: "#171717", bg: "bg-muted" },
]

export const DesignSystem = memo(() => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Crafted for <span className="text-primary italic">Precision</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Our design system is built on a foundation of clarity, speed, and modern aesthetics.
              Every element is pixel-perfect and optimized for the best user experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Color Palette */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold uppercase tracking-widest text-primary/80">Color Palette</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {colors.map((color) => (
                <motion.div
                  key={color.name}
                  whileHover={{ scale: 1.05 }}
                  className="space-y-3"
                >
                  <div className={`aspect-square rounded-2xl ${color.bg} shadow-lg shadow-black/20`} />
                  <div className="px-1">
                    <p className="text-sm font-bold">{color.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">{color.hex}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold uppercase tracking-widest text-primary/80">Typography</h3>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Heading 1 / Black</p>
                <p className="text-5xl font-black tracking-tight">The Quick Brown Fox</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Heading 2 / Bold</p>
                <p className="text-3xl font-bold tracking-tight">Jumps Over The Lazy Dog</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Body / Medium</p>
                <p className="text-muted-foreground leading-relaxed">
                  Design is not just what it looks like and feels like. Design is how it works.
                  Innovation distinguishes between a leader and a follower.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Component Showcase */}
        <div className="mt-24 space-y-8">
          <h3 className="text-xl font-bold uppercase tracking-widest text-primary/80">Component Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="clay-card p-8 bg-background/40 border border-border">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
              </div>
              <h4 className="text-lg font-bold mb-2">Glassmorphism</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Subtle blur and border effects create a sense of depth and hierarchy.
              </p>
            </div>
            <div className="clay-card p-8 bg-primary/10 border border-primary/20">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <span className="text-white font-black text-xl">A</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Active States</h4>
              <p className="text-xs text-primary/80 leading-relaxed font-medium">
                Vibrant accents highlight key interactions and state changes.
              </p>
            </div>
            <div className="clay-card p-8 bg-muted/40 border border-border">
              <div className="h-2 w-full bg-muted rounded-full mb-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "70%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
              <h4 className="text-lg font-bold mb-2">Micro-Animations</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Smooth transitions and progress indicators keep users engaged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

DesignSystem.displayName = "DesignSystem"
