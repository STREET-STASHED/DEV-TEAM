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
    .select('role, details_complete')
    .eq('id', session.user.id)
    .single();

  // Redirect if details are not complete (details step comes before role selection)
  if (!userInfo?.details_complete && !pathname.startsWith('/onboarding/details')) {
    return NextResponse.redirect(new URL('/onboarding/details', req.url));
  }

  // Redirect if role is not set (after details)
  if (!userInfo?.role && !pathname.startsWith('/onboarding/role')) {
    return NextResponse.redirect(new URL('/onboarding/role', req.url));
  }

  // Redirect to verify if both details and role are complete but verification not done
  if (
    userInfo?.role &&
    userInfo?.details_complete &&
    !pathname.startsWith('/onboarding/verify') &&
    !pathname.startsWith('/buyer') &&
    !pathname.startsWith('/seller') &&
    !pathname.startsWith('/stylist') &&
    !pathname.startsWith('/driver') &&
    !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.redirect(new URL('/onboarding/verify', req.url));
  }

  // Only enforce buyer redirect if onboarding is complete
  if (
    userInfo?.role === 'buyer' &&
    userInfo?.details_complete &&
    !pathname.startsWith('/buyer') &&
    !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.redirect(new URL('/buyer/marketplace', req.url));
  }

  if (
    userInfo?.role === 'seller' &&
    userInfo?.details_complete &&
    !pathname.startsWith('/seller') &&
    !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.redirect(new URL('/seller/dashboard', req.url));
  }

  if (
    userInfo?.role === 'stylist' &&
    userInfo?.details_complete &&
    !pathname.startsWith('/stylist') &&
    !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.redirect(new URL('/stylist/dashboard', req.url));
  }

  if (
    userInfo?.role === 'driver' &&
    userInfo?.details_complete &&
    !pathname.startsWith('/driver') &&
    !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.redirect(new URL('/driver/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|api/auth|public/).*)'],
};