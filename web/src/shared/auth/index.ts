import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "GOOGLE_PLACEHOLDER",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_SECRET_PLACEHOLDER",
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "GITHUB_PLACEHOLDER",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "GITHUB_SECRET_PLACEHOLDER",
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            return session
        },
        async jwt({ token, user, account }) {
            return token
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "SUPER_SECRET_PLACEHOLDER",
}

