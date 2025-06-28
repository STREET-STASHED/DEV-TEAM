import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;
  const user_id = req.cookies.get('sb-user-id')?.value;

  if (!token || !user_id) {
    if (
      req.nextUrl.pathname.startsWith("/onboarding") ||
      req.nextUrl.pathname.startsWith("/buyer") ||
      req.nextUrl.pathname.startsWith("/seller") ||
      req.nextUrl.pathname.startsWith("/driver") ||
      req.nextUrl.pathname.startsWith("/stylist") ||
      req.nextUrl.pathname.startsWith("/verify")
    ) {
      return NextResponse.redirect(new URL("/signup", req.url));
    }
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const { data: profile, error } = await supabase
    .from("users")
    .select("role, onboarding_complete, details_complete, verification_complete")
    .eq("id", user_id)
    .single();

  if (error || !profile) {
    console.error("Supabase error:", error);
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  const validRoles = ["buyer", "seller", "driver", "stylist"];
  if (!validRoles.includes(profile.role)) {
    console.error("Invalid role:", profile.role);
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  const path = req.nextUrl.pathname;

  if (!profile) {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  if (!profile.role && path !== "/onboarding/role") {
    return NextResponse.redirect(new URL("/onboarding/role", req.url));
  }

  if (profile.role && !profile.details_complete && path !== "/onboarding/details") {
    return NextResponse.redirect(new URL("/onboarding/details", req.url));
  }

  if (
    profile.role &&
    profile.details_complete &&
    !profile.verification_complete &&
    path !== "/onboarding/verify"
  ) {
    return NextResponse.redirect(new URL("/onboarding/verify", req.url));
  }

  if (
    profile.role &&
    profile.details_complete &&
    profile.verification_complete &&
    (path.startsWith("/onboarding") || path === "/signup")
  ) {
    return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, req.url));
  }

  return res;
}
