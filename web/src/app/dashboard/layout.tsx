import { DashboardLayoutContent } from "@/components/dashboard/DashboardLayoutContent"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayoutContent>{children}</DashboardLayoutContent>
}

