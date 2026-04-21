import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const ProjectHistoryHeader = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Project History</h1>
                <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
                    Manage and edit your previously generated portfolios. Update your site data or switch templates seamlessly.
                </p>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-12 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="w-5 h-5" />
                <span>Create New Portfolio</span>
            </Button>
        </div>
    )
}

