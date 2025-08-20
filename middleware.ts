import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 👇 Add all guest-accessible buyer/shopping pages here
const PUBLIC_PATHS = [
  "/",
  "/signup",
  "/login",
  "/marketplace",
  "/buyer",
  "/buyer/marketplace",
  "/browse",
  "/products",
  "/product",
  "/collections",
  "/categories",
  "/brands",
  "/search",
  "/favicon.ico",
];

// 👇 Admin-only routes
const ADMIN_PATHS = [
  "/admin",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies
            .getAll()
            .map(({ name, value }) => ({ name, value }));
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔓 Allow public/guest access to buyer routes and static paths
  if (
    !user &&
    (isPublicPath(pathname) ||
      pathname.startsWith("/_next") ||
      pathname.includes("/_error"))
  ) {
    return res;
  }

  // 🔒 Not logged in + not public = redirect to signup
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/signup";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // 🧠 Fetch profile info
  let profile = null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("has_completed_onboarding, role")
      .eq("id", user?.id)
      .single();
    if (error) {
      console.warn("[MIDDLEWARE] Profile fetch error:", error.message);
    } else {
      profile = data;
    }
  } catch (e) {
    console.error("[MIDDLEWARE] Failed to load profile:", e);
  }

  // 🔒 Admin route access control
  if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
    if (!profile || profile.role !== 'admin') {
      console.log("[MIDDLEWARE] Non-admin user attempting to access admin route");
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // 🚧 Not onboarded = force to /onboarding
  if (
    profile &&
    !profile.has_completed_onboarding &&
    !pathname.startsWith("/onboarding")
  ) {
    console.log("[MIDDLEWARE] Redirecting to onboarding");
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  // ⛔ Onboarded but visiting /onboarding = block
  if (
    profile &&
    profile.has_completed_onboarding &&
    pathname.startsWith("/onboarding")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 🧭 Shared dashboard path → redirect to role-specific dashboard
  if (profile?.has_completed_onboarding && pathname === "/dashboard") {
    const url = req.nextUrl.clone();
    if (profile.role === "driver") {
      url.pathname = "/driver/dashboard";
    } else if (profile.role === "stylist") {
      url.pathname = "/stylist/dashboard";
    } else if (profile.role === "seller" || profile.role === "seller/brand") {
      url.pathname = "/seller-dashboard";
    } else {
      url.pathname = "/buyer/marketplace";
    }
    return NextResponse.redirect(url);
  }

  console.log("[MIDDLEWARE] Allowing access to:", pathname);
  return res;
}

// ✅ This patch fixes API route interference
export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
