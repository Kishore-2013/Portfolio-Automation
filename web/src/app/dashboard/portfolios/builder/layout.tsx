"use client"

import React from "react"

export default function BuilderLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-[#0b0b0e] text-foreground select-none relative">
            <main className="h-full w-full relative z-10">
                {children}
            </main>
        </div>
    )
}

