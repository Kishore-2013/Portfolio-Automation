"use client"

import React, { memo } from "react"
import Link from "next/link"
import { Sparkles, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/stores/authStore"
import Image from "next/image"

export const Navbar = memo(() => {
    const { user, isAuthenticated } = useAuthStore()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    return (
        <>
            <motion.nav
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-2.5 bg-background/50 backdrop-blur-2xl border border-border rounded-2xl clay-card">
                    {/* Left: Branding */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95">
                            <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base font-black tracking-tight text-foreground">ApplyWizz</span>
                        </Link>
                    </div>

                    {/* Middle: Centered Nav Links (Desktop) */}
                    <div className="hidden md:flex items-center space-x-8">
                        {["Features", "Templates", "Pricing"].map((link) => (
                            <Link
                                key={link}
                                href={`#${link.toLowerCase()}`}
                                className="text-xs font-bold text-muted-foreground hover:text-primary transition-all active:scale-95"
                            >
                                {link}
                            </Link>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        
                        {!isAuthenticated ? (
                            <>
                                <div className="hidden sm:flex items-center gap-5">
                                    <Link href="/login" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                                        Log In
                                    </Link>
                                </div>

                                <Link href="/register" className="hidden sm:block">
                                    <Button className="bg-primary text-white hover:bg-primary/90 font-bold px-5 py-2 rounded-xl text-xs transition-all hover:scale-105 shadow-md h-auto">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-muted-foreground hidden md:inline-block">
                                    Hi, {user?.name.split(' ')[0]}
                                </span>
                                <Link href="/dashboard">
                                    <div className="h-8 w-8 p-0.5 rounded-full bg-gradient-to-tr from-primary to-purple-500 cursor-pointer shadow-sm active:scale-95 transition-transform relative">
                                        <Image
                                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                            alt="Profile"
                                            width={32}
                                            height={32}
                                            className="h-full w-full rounded-full border-2 border-background"
                                        />
                                    </div>
                                </Link>
                            </div>
                        )}

                        <button 
                            className="md:hidden p-1.5 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-6 top-24 z-[49] md:hidden"
                    >
                        <div className="bg-background/80 backdrop-blur-2xl border border-border rounded-2xl p-6 shadow-2xl clay-card flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                {["Features", "Templates", "Pricing"].map((link) => (
                                    <Link
                                        key={link}
                                        href={`#${link.toLowerCase()}`}
                                        className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link}
                                    </Link>
                                ))}
                            </div>
                            
                            <hr className="border-border" />
                            
                            {!isAuthenticated ? (
                                <div className="flex flex-col gap-4">
                                    <Link 
                                        href="/login" 
                                        className="text-lg font-bold text-foreground hover:text-primary transition-colors text-center py-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full bg-primary text-white font-bold py-4 rounded-xl text-base">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full bg-primary text-white font-bold py-4 rounded-xl text-base">
                                        Dashboard
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
})

Navbar.displayName = "Navbar"

