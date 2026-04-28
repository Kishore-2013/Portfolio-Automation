"use client"

import React, { Suspense } from "react"
import dynamic from "next/dynamic"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Dynamic import keeps Sandpack + Monaco out of SSR
const Builder = dynamic(
  () => import("@/components/builder/Builder"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-semibold uppercase tracking-widest">
          Booting IDE…
        </p>
      </div>
    ),
  }
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuilderPage() {
  return (
    <div className="h-screen w-screen bg-[#0b0b0e] overflow-hidden">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00ffcc]">
            Syncing Session…
          </p>
        </div>
      }>
        <Builder />
      </Suspense>
    </div>
  )
}

