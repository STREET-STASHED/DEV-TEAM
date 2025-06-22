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

        // Mock user authentication
        const user = {
          id: "mock-user-id-" + Math.random().toString(36).substring(2, 8),
          name: "Phillip",
          email: credentials.email,
          role: credentials.email.includes("stylist") ? "stylist"
               : credentials.email.includes("seller") ? "seller"
               : credentials.email.includes("driver") ? "driver"
               : "buyer"
        };

        return user;
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
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
        return `${baseUrl}/buyer/hub`;
      } catch {
        return baseUrl;
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
    async session(params) {
      const { session, token } = params;
      if (session.user) {
        (session.user as any).id = token?.id || null;
        (session.user as any).email = token?.email || null;
        (session.user as any).role = token?.role || "buyer";
      }
      if (!session.expires && (token as any).exp) {
        session.expires = new Date((token as any).exp * 1000).toISOString();
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "streetstashed-super-secret",
});
