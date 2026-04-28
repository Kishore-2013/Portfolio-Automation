"use client"

import React, { memo } from "react"
import { motion } from "framer-motion"

export const BackgroundAnimation = memo(() => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none opacity-30 dark:opacity-20 will-change-transform">
            {/* Grid Pattern */}
            <div className="absolute inset-0 grid-pattern opacity-50" />

            {/* Moving Blurs - Using translate for GPU acceleration */}
            <motion.div
                animate={{
                    x: [0, 80, 0],
                    y: [0, -80, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ willChange: "transform" }}
                className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"
            />

            <motion.div
                animate={{
                    x: [0, -100, 0],
                    y: [0, 100, 0],
                    scale: [1, 0.9, 1],
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ willChange: "transform" }}
                className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full"
            />

            <motion.div
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                }}
                style={{ willChange: "opacity" }}
                className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            />
        </div>
    )
})

BackgroundAnimation.displayName = "BackgroundAnimation"

