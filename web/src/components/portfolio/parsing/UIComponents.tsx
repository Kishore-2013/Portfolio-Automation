import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("clay-surface bg-background/40 backdrop-blur-md border border-border/50 p-6 transition-all duration-300", className)}>
        {children}
    </div>
)

export const HeaderSection = ({ title, icon: Icon, badge, subtitle }: { title: string, icon: any, badge?: string, subtitle?: string }) => (
    <div className="flex items-center justify-between mb-6 group">
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-black tracking-tight uppercase">{title}</h3>
                    {subtitle && <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{subtitle}</p>}
                </div>
            </div>
        </div>
        {badge && (
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                {badge}
            </span>
        )}
    </div>
)

export const InputField = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
    <div className="space-y-2 group">
        <div className="flex justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </label>
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Check className="w-2.5 h-2.5" />
                Parsed
            </span>
        </div>
        <input
            defaultValue={value}
            className="w-full bg-background/50 border border-border/50 h-12 px-4 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 transition-all outline-none border-transparent group-hover:border-border"
        />
    </div>
)

