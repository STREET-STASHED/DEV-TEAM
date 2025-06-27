import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  const onboardingSteps = ['/onboarding/role', '/onboarding/details', '/onboarding/verify'];
  if (onboardingSteps.includes(pathname)) {
    // Temporary gatekeeping logic placeholder
    // Assume role must be completed before accessing details or verify
    if ((pathname === '/onboarding/details' || pathname === '/onboarding/verify')) {
      const url = req.nextUrl.clone();
      url.pathname = '/onboarding/role';
      return NextResponse.redirect(url);
    }
    return res;
  }

  if (pathname === '/onboarding' || pathname === '/onboarding/') {
    const url = req.nextUrl.clone();
    url.pathname = '/onboarding/role';
    return NextResponse.redirect(url);
  }

  const isProtectedRoute = pathname.startsWith('/onboarding') ||
                           pathname.startsWith('/buyer') ||
                           pathname.startsWith('/seller') ||
                           pathname.startsWith('/stylist') ||
                           pathname.startsWith('/driver') ||
                           pathname.startsWith('/admin');

  // Without Supabase client in middleware, session check is removed or needs custom implementation
  // For now, we skip session-based redirects in middleware

  return res;
}

export const config = {
  matcher: [
    '/signup',
    '/onboarding/:path*',
    '/buyer/:path*',
    '/seller/:path*',
    '/stylist/:path*',
    '/driver/:path*',
    '/admin/:path*',
  ],
};
