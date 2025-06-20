// next-auth.d.ts
import NextAuth, { DefaultSession, User as DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: string | null; // <-- Add role here
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string | null; // <-- Add role here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
  }
}