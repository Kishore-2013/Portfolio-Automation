"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useTemplateStore } from "@/stores/templateStore"
import { projectService } from "@/services/project.service"
import { TemplateDTO } from "@/shared/types"
import { useState, useEffect, memo } from "react"

interface TemplateSelectionStepProps {
    onContinue: (template: TemplateDTO) => void
}

import { ClientTemplateGrid } from "@/components/templates/ClientTemplateGrid"

export const TemplateSelectionStep = ({ onContinue }: TemplateSelectionStepProps) => {
    return (
        <div className="space-y-12 max-w-[1600px] mx-auto">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-widest">
                    Step 1: Choose Your Foundation
                </div>
                <h2 className="text-5xl font-black tracking-tight uppercase italic leading-none">
                    Select <span className="text-primary italic">Architecture.</span>
                </h2>
                <p className="text-muted-foreground text-sm font-medium max-w-2xl mx-auto">
                    Choose a blueprint that matches your professional aesthetic. Every template is production-ready and fully customizable.
                </p>
            </div>

            <ClientTemplateGrid 
                showSearchInput={true}
                onSelect={(tpl) => {
                    onContinue(tpl)
                }}
            />
        </div>
    )
}

