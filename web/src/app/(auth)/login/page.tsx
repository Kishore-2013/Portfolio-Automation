import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
    title: "Login | Portfolio Automation Tool",
    description: "Enter your credentials to access your dashboard",
}

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <LoginForm />
        </div>
    )
}

