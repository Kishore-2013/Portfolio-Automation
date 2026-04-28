/*
import NextAuth from "next-auth"
import { authOptions } from "@/shared/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
*/

export async function GET() {
    return new Response("NextAuth is currently disabled.")
}

export async function POST() {
    return new Response("NextAuth is currently disabled.")
}
