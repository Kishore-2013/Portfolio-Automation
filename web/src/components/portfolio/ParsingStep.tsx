"use client"

import { GlassCard } from "./parsing/UIComponents"
import { ParsingHeader } from "./parsing/ParsingHeader"
import { SidePanel } from "./parsing/SidePanel"
import { ControlBar } from "./parsing/ControlBar"
import { DynamicSection } from "./parsing/DynamicSection"
import { MOCK_RECONCILIATION_DATA } from "./parsing/mockData"

interface ReconciliationStepProps {
    data: any
    onFinish: () => void
}

export const ParsingStep = ({ data, onFinish }: ReconciliationStepProps) => {
    const reconciliationData = data || MOCK_RECONCILIATION_DATA;

    // Filter out meta fields and redundant keys for the main content area
    const metaFields = [
        "progress", "unresolvedWarnings", "extraSections", "accuracy", 
        "missingRequired", "orphanedData", "personal", "socialLinks"
    ];
    
    const contentSections = Object.entries(reconciliationData)
        .filter(([key]) => !metaFields.includes(key));

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-48">
            <ParsingHeader data={reconciliationData} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 1. Parsed Information - Primary Content */}
                <div className="lg:col-span-8 space-y-8">
                    <GlassCard className="p-10 space-y-12">
                        {contentSections.map(([key, value]) => (
                            <DynamicSection 
                                key={key} 
                                title={key} 
                                value={value} 
                            />
                        ))}
                    </GlassCard>
                </div>

                {/* 2. Side Panel - Action Items & Orphaned Data */}
                <SidePanel data={reconciliationData} />
            </div>

            {/* Premium Integrated Control Bar */}
            <ControlBar data={reconciliationData} onFinish={onFinish} />
        </div>
    )
}
