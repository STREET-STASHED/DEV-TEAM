import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createBrowserClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  if (session && pathname === '/') {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const role = user?.user_metadata?.role;
    const detailsComplete = user?.user_metadata?.details_complete;
    const verified = user?.user_metadata?.verified;

    if (!role) return NextResponse.redirect(new URL('/onboarding/role', req.url));
    if (!detailsComplete) return NextResponse.redirect(new URL('/onboarding/details', req.url));
    if (!verified) return NextResponse.redirect(new URL('/onboarding/verify', req.url));

    if (role === 'buyer') return NextResponse.redirect(new URL('/buyer/dashboard', req.url));
    if (role === 'seller') return NextResponse.redirect(new URL('/seller/dashboard', req.url));
    if (role === 'stylist') return NextResponse.redirect(new URL('/stylist/dashboard', req.url));
    if (role === 'driver') return NextResponse.redirect(new URL('/driver/dashboard', req.url));
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  const isAuthRoute = pathname.startsWith('/onboarding') ||
                      pathname.startsWith('/buyer') ||
                      pathname.startsWith('/seller') ||
                      pathname.startsWith('/stylist') ||
                      pathname.startsWith('/driver') ||
                      pathname.startsWith('/admin');

  if (!session && isAuthRoute) {
    return NextResponse.redirect(new URL('/signup', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/signup',
    '/onboarding/:path*',
    '/buyer/:path*',
    '/seller/:path*',
    '/stylist/:path*',
    '/driver/:path*',
    '/admin/:path*',
  ],
};