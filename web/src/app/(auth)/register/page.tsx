import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
    title: "Register | Portfolio Automation Tool",
    description: "Create your account and start building your portfolio",
}

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <RegisterForm />
        </div>
    )
}

