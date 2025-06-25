import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

import type { User } from "next-auth";
import type { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            console.error("Error signing in with Supabase:", error);
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata.full_name || data.user.email,
            role: data.user.user_metadata.role || "buyer",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/onboarding/role",
    error: "/onboarding",
    newUser: "/onboarding/role",
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        const parsedUrl = new URL(url, baseUrl);
        const role = parsedUrl.searchParams.get("role");

        if (role === "seller") return `${baseUrl}/seller/dashboard`;
        if (role === "stylist") return `${baseUrl}/stylist/dashboard`;
        if (role === "driver") return `${baseUrl}/driver/dashboard`;

        return `${baseUrl}/marketplace`;
      } catch {
        return `${baseUrl}/marketplace`;
      }
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? null;
        token.role = user.role ?? "buyer";
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.email = token.email ?? null;
        session.user.role = token.role ?? "buyer";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "streetstashed-super-secret",
};

export default NextAuth(authOptions);