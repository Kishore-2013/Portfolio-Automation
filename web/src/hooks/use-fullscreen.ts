import { useState, useCallback, useEffect } from "react"

export function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(false)

    const toggleFullscreen = useCallback(async (element?: HTMLElement) => {
        const target = element || document.documentElement

        if (!document.fullscreenElement) {
            try {
                await target.requestFullscreen()
                setIsFullscreen(true)
            } catch (err) {
                // FS failed
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }, [])

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [])

    return { isFullscreen, toggleFullscreen }
}

