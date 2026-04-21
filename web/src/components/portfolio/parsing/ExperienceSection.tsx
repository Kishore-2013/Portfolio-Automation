"use client"

import { Layers, Plus, Trash2 } from "lucide-react"
import { HeaderSection } from "./UIComponents"
import { ReconciliationData } from "./types"

interface ExperienceSectionProps {
    data: ReconciliationData;
}

export const ExperienceSection = ({ data }: ExperienceSectionProps) => {
    return (
        <section className="space-y-8 pt-12 border-t border-border/50">
            <HeaderSection
                title="Experience Timeline"
                icon={Layers}
                badge={`${(data.experience ?? []).length} Roles Found`}
                subtitle="Professional history mapped to schema"
            />
            <div className="space-y-6">
                {(data.experience ?? []).map((exp, i) => (
                    <div key={i} className="group relative bg-muted/20 border border-border/30 rounded-3xl p-8 hover:bg-muted/30 transition-all">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                                <h5 className="text-lg font-black tracking-tight">{exp.role}</h5>
                                <p className="text-primary font-bold text-sm tracking-tight">{exp.company}</p>
                            </div>
                            <span className="text-[11px] font-black text-muted-foreground uppercase bg-background px-3 py-1 rounded-full border border-border/50 self-start">
                                {exp.period}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-3xl">{exp.desc}</p>
                        <button className="absolute top-8 right-8 md:opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                <button className="w-full h-16 border-2 border-dashed border-border/50 rounded-3xl text-sm font-black uppercase tracking-widest text-muted-foreground hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Experience
                </button>
            </div>
        </section>
    )
}

