"use client"

import * as React from "react"
import Link from "next/link"
import { Github, Target, Eye, EyeOff, Lock, Mail, User, ShieldCheck, ArrowRight, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/stores/authStore"
import { useRouter } from "next/navigation"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { useSnackbar } from "notistack"

export function RegisterForm() {
    const router = useRouter()
    const { enqueueSnackbar } = useSnackbar()
    const setAuth = useAuthStore((state) => state.setAuth)
    const [showPassword, setShowPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreed: false
    })

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const hue = useMotionValue(220)

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect()
        const x = clientX - left
        const y = clientY - top
        mouseX.set(x)
        mouseY.set(y)

        // Map cursor position to a dynamic hue value for the glow
        // Base hue is around 200 (blue), and it shifts towards purple/pink/cyan depending on where the cursor is
        const dynamicHue = 190 + (x / width) * 80 + (y / height) * 80
        hue.set(dynamicHue)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.agreed) {
            enqueueSnackbar("Terms and Conditions must be accepted", { variant: "warning", style: { background: "#eab308", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
            return
        }

        if (formData.password !== formData.confirmPassword) {
            enqueueSnackbar("Passwords do not match", { variant: "warning", style: { background: "#eab308", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
            return
        }

        setIsLoading(true)

        try {
            const result = await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            })
            const accessToken = result.tokens?.accessToken || (result as any).accessToken;
            if (accessToken) {
                setAuth(result.user, accessToken);
                enqueueSnackbar("Account successfully created.", { variant: "success", style: { background: "#10b981", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
                router.push("/dashboard");
            } else {
                throw new Error("Tokens missing from response");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || "Registration failed. Please try again."
            enqueueSnackbar(errorMessage, { variant: "error", style: { background: "#ef4444", color: "white", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px", textTransform: "uppercase" } })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto group relative"
            onMouseMove={handleMouseMove}
        >
            <div className="relative p-0.5 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-white/5 to-transparent overflow-hidden">
                {/* Dynamic Cursor Tracking Glow */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100 z-0"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                600px circle at ${mouseX}px ${mouseY}px,
                                hsla(${hue}, 80%, 55%, 0.25),
                                transparent 80%
                            )
                        `,
                    }}
                />
                <div className="relative p-8 md:p-10 bg-black/40 backdrop-blur-3xl rounded-[2.4rem] border border-white/5 shadow-2xl space-y-8 z-10 transition-colors duration-500 hover:bg-black/50">
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />

                    <div className="text-center space-y-2 relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-px w-8 bg-primary/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">New Developer</span>
                            <div className="h-px w-8 bg-primary/20" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-[-0.05em] text-white uppercase italic leading-none">
                            Setup <span className="text-primary italic">Account.</span>
                        </h2>
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-widest italic pt-2">
                            Join the Platform Network
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <User className="w-3 h-3 text-primary" /> Full Name
                            </label>
                            <Input
                                type="text"
                                placeholder="JOHN DOE"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-14 px-6 rounded-2xl bg-white/[0.03] border-white/5 transition-all focus:border-primary/50 focus:bg-white/[0.05] font-mono text-sm placeholder:opacity-20 uppercase tracking-widest"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Mail className="w-3 h-3 text-primary" /> Working Email
                            </label>
                            <Input
                                type="email"
                                placeholder="HELLO@EXAMPLE.COM"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-14 px-6 rounded-2xl bg-white/[0.03] border-white/5 transition-all focus:border-primary/50 focus:bg-white/[0.05] font-mono text-sm placeholder:opacity-20 uppercase tracking-widest"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Lock className="w-3 h-3 text-primary" /> Create Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-14 px-6 rounded-2xl bg-white/[0.03] border-white/5 transition-all focus:border-primary/50 focus:bg-white/[0.05] font-mono text-sm"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-primary" /> Confirm Password
                            </label>
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="h-14 px-6 rounded-2xl bg-white/[0.03] border-white/5 transition-all focus:border-primary/50 focus:bg-white/[0.05] font-mono text-sm"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex items-center gap-4 group cursor-pointer w-fit" onClick={() => !isLoading && setFormData({ ...formData, agreed: !formData.agreed })}>
                            <div className={`w-5 h-5 rounded-lg border border-white/10 flex items-center justify-center transition-all ${formData.agreed ? "bg-primary border-primary" : "bg-white/5 group-hover:border-primary"}`}>
                                {formData.agreed && <ArrowRight className="w-3 h-3 text-white" />}
                            </div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                                I accept the Terms & Privacy Policy
                            </p>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full h-16 md:h-20 rounded-2xl bg-primary text-white text-base font-black uppercase italic tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_40px_rgba(37,99,235,0.3)] group relative overflow-hidden mt-6"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isLoading ? "Creating..." : <>Create Account <Target className="w-4 h-4 rotate-45 group-hover:scale-125 transition-transform" /></>}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </Button>
                    </form>

                    <p className="text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] relative z-10 pt-2">
                        Already have an account? <Link href="/login" className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all">Sign In</Link>
                    </p>
                </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-[9px] font-black uppercase tracking-widest text-gray-600 italic opacity-40">
                <span className="flex items-center gap-2 underline decoration-gray-800">Privacy_Core</span>
                <span className="w-1 h-1 bg-gray-800 rounded-full" />
                <span className="flex items-center gap-2 underline decoration-gray-800">Terms_Sys</span>
            </div>
        </motion.div>
    )
}

