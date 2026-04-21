"use client"

import { User, Mail, Github, Linkedin } from "lucide-react"
import { HeaderSection, InputField } from "./UIComponents"
import { ReconciliationData } from "./types"

interface PersonalIdentitySectionProps {
    data: ReconciliationData;
}

export const PersonalIdentitySection = ({ data }: PersonalIdentitySectionProps) => {
    return (
        <section className="space-y-8">
            <HeaderSection
                title="Personal Identity"
                icon={User}
                badge="Verified Header"
                subtitle="Core contact and identification details"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label="Full Name" value={data.personalDetails?.fullName ?? ""} icon={User} />
                <InputField label="Email Address" value={data.personalDetails?.email ?? ""} icon={Mail} />
                <InputField label="Github" value={data.personalDetails?.github ?? ""} icon={Github} />
                <InputField label="LinkedIn" value={data.personalDetails?.linkedin ?? ""} icon={Linkedin} />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                    <span>Professional Narrative</span>
                    <span>~150 characters</span>
                </div>
                <textarea
                    className="w-full bg-background/50 border border-border/50 rounded-2xl p-6 text-sm font-medium leading-relaxed focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[160px]"
                    defaultValue={data.personalDetails?.summary ?? ""}
                />
            </div>
        </section>
    )
}

