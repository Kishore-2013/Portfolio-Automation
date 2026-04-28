"use client"

import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Sparkles } from "lucide-react"
import Link from "next/link"

export const Footer = () => {
    return (
        <footer className="relative pt-32 pb-16 px-6 bg-background border-t border-border overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col gap-24 relative z-10">
                {/* Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                    {/* Brand Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-tighter hover:scale-105 transition-transform">
                            <div className="bg-primary p-2 rounded-xl shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-foreground">ApplyWizz</span>
                        </Link>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-xs">
                            The world's first resume-to-code automation engine. Empowering professionals to own their digital identity.
                        </p>
                        <div className="flex items-center gap-6 text-muted-foreground">
                            {[Twitter, Github, Linkedin].map((Icon, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.2, color: "var(--foreground)" }}
                                    className="cursor-pointer transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Link Groups */}
                    {[
                        {
                            title: "Product",
                            links: ["Dashboard", "Templates", "Integrations", "Custom Domains"]
                        },
                        {
                            title: "Resources",
                            links: ["Documentation", "Guides", "Support", "API Reference"]
                        },
                        {
                            title: "Company",
                            links: ["About Us", "Profile", "Privacy Policy", "Terms of Service"]
                        }
                    ].map((group, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{group.title}</h4>
                            <div className="flex flex-col gap-4 text-muted-foreground font-bold text-sm">
                                {group.links.map((link) => (
                                    <Link
                                        key={link}
                                        href="#"
                                        className="hover:text-primary transition-all duration-300 inline-block"
                                    >
                                        {link}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-muted-foreground font-medium text-xs">
                        © 2026 Portfolio Automation Tool Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8 text-muted-foreground font-black text-[10px] uppercase tracking-[0.1em]">
                        {["Status", "Security", "Cookies"].map((item) => (
                            <a key={item} href="#" className="hover:text-foreground transition-colors">{item}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

