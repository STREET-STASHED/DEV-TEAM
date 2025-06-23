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
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(credentials.email)}`, {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              Prefer: 'return=representation'
            }
          });

          if (!res.ok) {
            console.error("Supabase fetch error:", res.statusText);
            return null;
          }

          const users = await res.json();
          const user = users?.[0];

          if (user) {
            return {
              id: user.id,
              name: user.full_name || user.email,
              email: user.email,
              role: user.role || 'buyer'
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/onboarding",
    error: "/onboarding",
    newUser: "/onboarding"
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const parsedUrl = new URL(url, baseUrl);
        const role = parsedUrl.searchParams.get("role");

        if (role === "seller") return `${baseUrl}/seller/dashboard`;
        if (role === "stylist") return `${baseUrl}/stylist/dashboard`;
        if (role === "driver") return `${baseUrl}/driver/dashboard`;

        // default to buyer
        return `${baseUrl}/marketplace`;
      } catch {
        return `${baseUrl}/marketplace`;
      }
    },
    async jwt(params) {
      const { token, user } = params;
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user = {
          name: null,
          email: token.email ?? null,
          image: null,
          id: token.id,
          role: token.role || 'buyer',
        } as unknown as Session["user"];
      }
      session.expires = typeof token.exp === 'number' ? new Date(token.exp * 1000).toISOString() : session.expires;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "streetstashed-super-secret",
});
