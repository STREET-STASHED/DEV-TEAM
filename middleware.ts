import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  // Allow access to public routes
  if (!session) {
    if (
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/buyer/marketplace') ||
      (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) ||
      pathname.startsWith('/_next') ||
      pathname === '/' ||
      pathname.includes('.')
    ) {
      return res;
    }

    // Redirect unauthenticated users trying to access protected routes
    return NextResponse.redirect(new URL('/onboarding/details', req.url));
  }

  const { data: userInfo } = await supabase
    .from('users')
    .select('role, details_complete, verified')
    .eq('id', session.user.id)
    .single();

  // 1. Role Step
  if (!userInfo?.role && !pathname.startsWith('/onboarding/role')) {
    return NextResponse.redirect(new URL('/onboarding/role', req.url));
  }

  // 2. Details Step
  if (!userInfo?.details_complete && !pathname.startsWith('/onboarding/details')) {
    return NextResponse.redirect(new URL('/onboarding/details', req.url));
  }

  // 3. Verify Step
  if (
    userInfo?.details_complete &&
    userInfo?.role &&
    !userInfo?.verified &&
    !pathname.startsWith('/onboarding/verify')
  ) {
    return NextResponse.redirect(new URL('/onboarding/verify', req.url));
  }

  // 4. Role-Based Dashboard Redirect (Only after verification)
  if (userInfo?.verified) {
    if (
      userInfo?.role === 'buyer' &&
      !pathname.startsWith('/buyer') &&
      !pathname.startsWith('/api/auth')
    ) {
      return NextResponse.redirect(new URL('/buyer/marketplace', req.url));
    }

    if (
      userInfo?.role === 'seller' &&
      !pathname.startsWith('/seller') &&
      !pathname.startsWith('/api/auth')
    ) {
      return NextResponse.redirect(new URL('/seller/dashboard', req.url));
    }

    if (
      userInfo?.role === 'stylist' &&
      !pathname.startsWith('/stylist') &&
      !pathname.startsWith('/api/auth')
    ) {
      return NextResponse.redirect(new URL('/stylist/dashboard', req.url));
    }

    if (
      userInfo?.role === 'driver' &&
      !pathname.startsWith('/driver') &&
      !pathname.startsWith('/api/auth')
    ) {
      return NextResponse.redirect(new URL('/driver/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|api/auth|public/).*)'],
};