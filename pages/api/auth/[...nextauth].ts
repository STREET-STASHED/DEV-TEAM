import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Replace with your Supabase logic or API call
        if (
          credentials?.email === "admin@streetstashed.com" &&
          credentials?.password === "password123"
        ) {
          return { id: "1", name: "Admin", email: "admin@streetstashed.com", role: "admin" };
        }
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt(params) {
      const { token, user } = params;
      if (user && (user as any).role) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session(params) {
      const { session, token } = params;
      if (session.user) {
        (session.user as any).role = token.role as string | undefined;
      }
      // Ensure session.expires exists for TypeScript
      if (!session.expires && (token as any).exp) {
        session.expires = new Date((token as any).exp * 1000).toISOString();
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "streetstashed-super-secret",
});
