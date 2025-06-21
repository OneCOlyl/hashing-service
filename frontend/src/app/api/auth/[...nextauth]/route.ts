import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env["GITHUB_ID"] || "",
      clientSecret: process.env["GITHUB_SECRET"] || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const isAdmin = user.email === process.env["ADMIN_EMAIL"]
        if (isAdmin) {
          token.role = "admin"
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }