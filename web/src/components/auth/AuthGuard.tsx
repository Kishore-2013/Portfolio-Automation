"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { Loader2 } from "lucide-react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const isHydrated = useAuthStore(s => (s as any)._hasHydrated) || false
    const { isAuthenticated, user } = useAuthStore()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Hydration fail-safe: Force hydration status after a short delay if it fails to trigger
        const timer = setTimeout(() => {
            if (!isHydrated) {
                useAuthStore.getState().setHasHydrated(true);
            }
        }, 500);

        if (!isHydrated) return () => clearTimeout(timer);

        const publicPaths = ["/", "/login", "/register"]
        const isPublicPath = publicPaths.includes(pathname)

        if (!isAuthenticated && !isPublicPath) {
            router.push("/login")
        } else if (isAuthenticated && isPublicPath && pathname !== "/") {
            router.push("/dashboard")
        } else {
            setIsChecking(false)
        }
        
        return () => clearTimeout(timer);
    }, [isHydrated, isAuthenticated, pathname, router])

    if (isChecking) {
        return (
            <div className="h-screen w-screen bg-[#0b0b0e] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Verifying Identity...</p>
            </div>
        )
    }

    return <>{children}</>
}

