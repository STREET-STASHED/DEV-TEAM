import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

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
