"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface StepIndicatorProps {
    currentStep: number
    steps: string[]
}

export const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
    return (
        <div className="flex items-center justify-center w-full max-w-2xl mx-auto py-12">
            {steps.map((step, i) => {
                const isCompleted = currentStep > i + 1
                const isActive = currentStep === i + 1

                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isActive || isCompleted ? "var(--primary)" : "var(--muted)",
                                    scale: isActive ? 1.2 : 1,
                                }}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-4 border-background transition-all shadow-xl shadow-primary/10",
                                    isActive || isCompleted ? "text-primary-foreground" : "text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-xs font-black">{i + 1}</span>
                                )}
                            </motion.div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors",
                                isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {step}
                            </span>
                        </div>

                        {i < steps.length - 1 && (
                            <div className="h-[2px] w-full bg-muted mx-4 -mt-8 relative overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: isCompleted ? "100%" : "0%" }}
                                    className="absolute inset-0 bg-primary"
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

