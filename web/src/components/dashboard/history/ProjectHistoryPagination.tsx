import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export const ProjectHistoryPagination = () => {
    return (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border pt-8 pb-4">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Page <span className="text-foreground font-black">1</span> of <span className="text-foreground font-black">4</span>
            </div>

            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 cursor-not-allowed">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                </button>

                {[1, 2, 3, 4].map((page) => (
                    <button
                        key={page}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                            page === 1
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                        )}
                    >
                        {page}
                    </button>
                ))}

                <button className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all active:scale-95">
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

