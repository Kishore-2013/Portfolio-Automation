"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            router.push("/login")
        }
    }, [mounted, isAuthenticated, router])

    if (!mounted || !isAuthenticated) {
        return null
    }

    return <>{children}</>
}

