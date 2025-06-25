import NextAuth from "next-auth/next";
import type { AuthOptions } from "next-auth/core/types";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { type JWT } from "next-auth/jwt";

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
    signIn: "/signup",
    error: "/signup",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const parsedUrl = new URL(url, baseUrl);
        const step = parsedUrl.searchParams.get("onboarding");
        const role = parsedUrl.searchParams.get("role");

        if (step === "details") return `${baseUrl}/onboarding/details`;
        if (step === "role") return `${baseUrl}/onboarding/role`;
        if (step === "verify") return `${baseUrl}/onboarding/verify`;

        if (role) {
          switch (role) {
            case "seller":
              return `${baseUrl}/seller/dashboard`;
            case "stylist":
              return `${baseUrl}/stylist/dashboard`;
            case "driver":
              return `${baseUrl}/driver/dashboard`;
            default:
              return `${baseUrl}/buyer/marketplace`;
          }
        }

        return `${baseUrl}/buyer/marketplace`;
      } catch {
        return `${baseUrl}/buyer/marketplace`;
      }
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? null;
        token.role = user.role ?? "buyer";
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.email = token.email ?? null;
        session.user.role = token.role ?? "buyer";
        session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "streetstashed-super-secret",
};

export default NextAuth(authOptions);