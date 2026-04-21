"use client"

import { motion } from "framer-motion"
import { Briefcase, GraduationCap, Trophy, Award, Link as LinkIcon, Code, User, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface DynamicSectionProps {
    title: string
    value: any
}

export const DynamicSection = ({ title, value }: DynamicSectionProps) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    // Helper to get consistent icons for sections
    const getIcon = (key: string) => {
        const k = key.toLowerCase();
        if (k.includes('experience')) return <Briefcase className="w-4 h-4" />;
        if (k.includes('education')) return <GraduationCap className="w-4 h-4" />;
        if (k.includes('project')) return <Code className="w-4 h-4" />;
        if (k.includes('skill')) return <Trophy className="w-4 h-4" />;
        if (k.includes('cert') || k.includes('award')) return <Award className="w-4 h-4" />;
        if (k.includes('personal') || k.includes('identity')) return <User className="w-4 h-4" />;
        if (k.includes('summary')) return <FileText className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };


    // Format section labels (e.g., "personalDetails" -> "Personal Details")
    const formatLabel = (key: string) => {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getIcon(title)}
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">
                    {formatLabel(title)}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-4" />
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                {typeof value === 'object' && !Array.isArray(value) ? (
                    Object.entries(value).map(([key, val]) => (
                        <div key={key} className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{formatLabel(key)}</label>
                            <p className="text-sm font-bold text-gray-800 break-words">
                                {String(val || '—')}
                            </p>
                        </div>
                    ))
                ) : Array.isArray(value) ? (
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {value.map((item, idx) => (
                            <div key={idx} className={cn(
                                "p-5 rounded-2xl bg-black/5 border border-black/5 space-y-3 transition-all",
                                "hover:bg-black/10 hover:border-black/10"
                            )}>
                                {typeof item === 'string' ? (
                                    <p className="text-sm font-bold text-gray-800">{item}</p>
                                ) : (
                                    Object.entries(item).map(([k, v]) => (
                                        <div key={k} className="space-y-1">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em]">{formatLabel(k)}</span>
                                            <p className="text-sm font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">{String(v || '')}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="col-span-2">
                        <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {String(value)}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
