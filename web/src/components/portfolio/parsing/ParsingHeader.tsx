"use client"

import { Check, BrainCircuit } from "lucide-react"
import { ReconciliationData } from "./types"

interface ParsingHeaderProps {
    data: ReconciliationData;
}

export const ParsingHeader = ({ data }: ParsingHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 border-b border-border/50 pb-12">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Verification Phase
                    </div>
                    <div className="h-0.5 w-12 bg-primary/20 rounded-full" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> AI Engine v2.4
                    </span>
                </div>
                <h2 className="text-5xl font-black tracking-tighter">Data Reconciliation</h2>
                <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                    Our AI has mapped your professional story. Review the extraction accuracy and finalize your data for the <span className="text-foreground font-black underline decoration-primary underline-offset-4">Neo-Noir</span> template.
                </p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex items-center gap-6">
                <div className="text-right space-y-1">
                    <p className="text-3xl font-black tracking-tighter text-primary">{data.accuracy ?? "—"}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Across 42 data points</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30">
                    <Check className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}

