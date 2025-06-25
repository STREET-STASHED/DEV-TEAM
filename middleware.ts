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

  // If details are incomplete, redirect to onboarding details step
  if (!userInfo?.details_complete && !pathname.startsWith('/onboarding/details')) {
    return NextResponse.redirect(new URL('/onboarding/details', req.url));
  }

  // If role is missing after details, redirect to onboarding role step
  if (!userInfo?.role && !pathname.startsWith('/onboarding/role')) {
    return NextResponse.redirect(new URL('/onboarding/role', req.url));
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

  return res;
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|api/auth|public/).*)'],
};