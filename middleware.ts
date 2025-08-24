import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 👇 Only admin routes are restricted

// 👇 Admin-only routes
const ADMIN_PATHS = [
  "/admin",
];



// Check if user has test authentication
function hasTestAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer test-token-')) {
    return true;
  }
  
  // Check for test auth in cookies (for client-side requests)
  const testAuthCookie = req.cookies.get('test-auth-session');
  return testAuthCookie ? true : false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const res = NextResponse.next();
  
  // Check for test authentication first
  if (hasTestAuth(req)) {
    console.log("[MIDDLEWARE] Test authentication detected, allowing access to:", pathname);
    return res;
  }

  // 🔓 Allow ALL paths for guest users - only restrict specific actions, not page access
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/_error") ||
    pathname.includes("/api/") // Allow API access
  ) {
    return res;
  }

  // 🔒 Only restrict admin routes to admin users
  if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
    try {
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

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Guest user trying to access admin - redirect to home
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      // Check if user is admin
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (!profile || profile.role !== 'admin') {
          const url = req.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      } catch (e) {
        // If profile check fails, redirect to home
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } catch (e) {
      // If Supabase fails, redirect to home
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // ✅ Allow access to all other pages for everyone (guest users and signed-in users)
  console.log("[MIDDLEWARE] Allowing access to:", pathname);
  return res;
}

// ✅ This patch fixes API route interference
export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
