import { NextResponse, NextRequest } from "next/server";

// 👇 Only admin routes are restricted

// 👇 Admin-only routes
const ADMIN_PATHS = [
  "/admin",
];





export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const res = NextResponse.next();

  // Add headers to prevent static caching
  res.headers.set('Cache-Control', 'no-store, max-age=0');
  res.headers.set('X-Dynamic-Render', 'true');

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
    // Check for auth token in cookies (simplified approach for Edge Runtime)
    const authToken = req.cookies.get('sb-access-token')?.value;
    
    if (!authToken) {
      // No auth token - redirect to home
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    
    // For now, allow access if token exists (admin check moved to API routes)
    // This is a simplified approach - full admin validation happens in the API
  }

  // ✅ Allow access to all other pages for everyone (guest users and signed-in users)
  console.log("[MIDDLEWARE] Allowing access to:", pathname);
  return res;
}

// ✅ This patch fixes API route interference
export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
