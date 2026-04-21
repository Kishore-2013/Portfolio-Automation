"use client";

import * as React from "react"
import Link from "next/link"
import { Sparkles, Terminal } from "lucide-react"
import { BackgroundAnimation } from "@/components/sections/background-animation"
import { motion } from "framer-motion"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen bg-[#060606] text-white selection:bg-primary/30 font-sans antialiased overflow-hidden flex flex-col items-center justify-center py-4 px-6">
            {/* Ultra-Premium Background Elements */}
            <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none translate-y-1/2" />

            <BackgroundAnimation />


            <main className="w-full max-w-xl relative z-10 flex flex-col items-center justify-center">
                {children}
            </main>
            <div className="absolute bottom-8 left-8 text-[10px] font-black uppercase tracking-[0.5em] text-white/5 pointer-events-none select-none italic">
                Secure Terminal Access
            </div>
        </div>
    )
}

