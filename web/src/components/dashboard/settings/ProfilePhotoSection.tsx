"use client"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { userProfile as staticProfile } from "@/data/userProfile"
import { User } from "lucide-react"

export const ProfilePhotoSection = () => {
    const { user } = useAuthStore()
    return (
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-[2.5rem] p-8 md:p-10 shadow-sm mb-12">
            <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                    <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-background shadow-2xl group-hover:rotate-3 transition-all duration-500 bg-primary/10 flex items-center justify-center">
                        {user?.name ? (
                            <span className="text-4xl font-black text-primary uppercase">
                                {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        ) : (
                            <User className="w-16 h-16 text-primary" />
                        )}
                    </div>
                    <div className="absolute inset-x-0 bottom-4 px-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <div className="bg-background/90 backdrop-blur-sm border border-border rounded-xl py-2 text-center shadow-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Update</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 text-center md:text-left flex-1">
                    <div className="space-y-2">
                        <h3 className="font-black text-2xl text-foreground uppercase tracking-tight">Profile Photo</h3>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm">This photo will be used on your generated portfolios and dashboard.</p>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <Button className="bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30 rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest h-12 transition-all active:scale-95">
                            Change Photo
                        </Button>
                        <Button variant="outline" className="border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest h-12 transition-all active:scale-95">
                            Remove
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

