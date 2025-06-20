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

        // Simulated Supabase call
        const user = {
          id: "user-id-123",
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
      // Always redirect to the internal app unless full URL provided
      return url.startsWith("/") ? `${baseUrl}${url}` : url;
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
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).role = token.role;
      }
      if (!session.expires && (token as any).exp) {
        session.expires = new Date((token as any).exp * 1000).toISOString();
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "streetstashed-super-secret",
});
